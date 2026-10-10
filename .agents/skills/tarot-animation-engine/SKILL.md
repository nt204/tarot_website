---
name: tarot-animation-engine
description: >-
  Chuyên gia kiến trúc và triển khai animation cho ứng dụng Tarot Web AI.
  Sử dụng stack Next.js + TypeScript + Tailwind CSS + Motion for React + GSAP + CSS 3D.
  Áp dụng khi xây dựng giao diện xào bài, trải hình quạt, chọn lá, rút bài, lật bài 3D và hiển thị luận giải.
---

# Tarot Web Animation Engine & Architecture Skill

Bộ quy chuẩn kỹ thuật và kiến trúc animation chuyên sâu dành cho web ứng dụng **Tarot AI**, tối ưu đạt chuẩn 60 FPS trên cả thiết bị di động.

---

## 1. Phân Công Vai Trò Công Nghệ (Tech Stack Allocation)

| Công nghệ | Vai trò đảm nhiệm | Phạm vi chi tiết |
| :--- | :--- | :--- |
| **Next.js (App Router) + TS** | Ứng dụng & Logic nền | Quản lý routing, trạng thái bàn bài, gọi AI streaming luận giải, SSR/SSG. |
| **Tailwind CSS** | Styling & Theme System | Palette màu huyền bí (mystic dark, gold metallic), responsive layout, token quản lý. |
| **GSAP (Core + Timeline)** | Điều phối chuỗi chuyển động lớn | Chuỗi kịch bản tuần tự: Xào bài (Shuffle) $\rightarrow$ Gom tụ (Stack) $\rightarrow$ Trải quạt (Fan Out) $\rightarrow$ Rút lá vào vị trí (Deal to Slot). |
| **Motion for React** | Vi tương tác & Spring Physics | Hover nhấc bài, chạm chọn (tap lift), kéo thả lá bài, chuyển đổi màn hình, hiệu ứng text AI reveal. |
| **CSS 3D Transform** | Chiều sâu & Lật mặt bài | `perspective`, `transform-style: preserve-3d`, `rotateY(180deg)` lật mặt trước/sau cực mượt bằng GPU. |
| **PixiJS (Tùy chọn)** | Hiệu ứng hạt vũ trụ nâng cao | Lớp canvas riêng biệt cho stardust, sao bay, vòng tròn ma pháp (nếu bật chế độ đồ họa cao). |

---

## 2. Nguyên Tắc Cốt Lõi: Tách Biệt Transform (Transform Separation)

> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG** để GSAP và Motion cùng điều khiển thuộc tính `transform` (`x`, `y`, `rotate`, `scale`) trên cùng một DOM element. Việc tranh chấp transform giữa hai thư viện sẽ gây giật khựng (jank) hoặc mất trạng thái matrix.

### Kiến Trúc Wrapper Lồng Nhau (Nested Wrappers Architecture)

Mỗi lá bài Tarot trên bàn phải được cấu trúc thành 3 tầng phân định rạch ròi:

```tsx
/* 
  Tầng 1 (Outer - GSAP): Quản lý tọa độ không gian trên bàn (Trajectory, Position, Fan Angle, zIndex)
  Tầng 2 (Middle - Motion): Quản lý tương tác người dùng (Hover Lift, Tap Tilt, Spring drag)
  Tầng 3 (Inner - CSS 3D): Quản lý lật bài (Flip Front/Back, 3D Perspective)
*/

<div 
  ref={gsapCardRef} 
  className="absolute will-change-transform pointer-events-auto"
  style={{ transformOrigin: "bottom center" }}
>
  <motion.div
    whileHover={{ y: -24, scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className="cursor-pointer"
  >
    <div className={`card-3d-flipper ${isFlipped ? 'flipped' : ''}`}>
      <div className="card-face card-back">...</div>
      <div className="card-face card-front">...</div>
    </div>
  </motion.div>
</div>
```

---

## 3. Kịch Bản & Thuật Toán Animation (Animation Recipes)

### 3.1. Tối Ưu Hóa Số Lượng Lá Bài Khi Xào (Virtual Deck)
* Không bao giờ render toàn bộ 78 thẻ bài DOM chuyển động cùng lúc.
* Chỉ dùng **12 đến 16 lá bài đại diện** (`deckProxyCards`) mang hình ảnh mặt lưng (`card_back.jpg`) trong quá trình xào bài và gom tụ.
* Khi người chơi bắt đầu trải bài hình quạt, tăng lên **22 lá** (hoặc số lượng vừa vặn màn hình viewport) để chọn.

### 3.2. Thuật Toán Trải Bài Hình Quạt (Fan-Out Formula)
Trải các lá bài theo cung tròn với bán kính $R$ và góc mở $\theta$:

```ts
export function calculateFanTransform(index: number, totalCards: number, isMobile: boolean) {
  const maxAngle = isMobile ? 50 : 75; // Độ mở quạt (độ)
  const angleStep = maxAngle / (totalCards - 1);
  const startAngle = -maxAngle / 2;
  const currentAngle = startAngle + index * angleStep;
  
  // Tính độ cong nâng lên / hạ xuống theo vòng cung Parabol
  const normalizedIndex = (index - (totalCards - 1) / 2) / ((totalCards - 1) / 2); // -1 đến 1
  const arcY = Math.pow(normalizedIndex, 2) * (isMobile ? 25 : 45); // Hạ thấp ở 2 rìa
  
  return {
    rotation: currentAngle,
    x: (index - (totalCards - 1) / 2) * (isMobile ? 14 : 26),
    y: arcY,
  };
}
```

### 3.3. GSAP Timeline Chuỗi Xào $\rightarrow$ Gom $\rightarrow$ Trải Quạt

```ts
import gsap from 'gsap';

export function runShuffleAndFanSequence(cardElements: HTMLElement[], onComplete?: () => void) {
  const tl = gsap.timeline({ onComplete });

  // 1. Phân tán xào bài ngẫu nhiên (Shuffle chaos)
  tl.to(cardElements, {
    x: () => gsap.utils.random(-80, 80),
    y: () => gsap.utils.random(-30, 30),
    rotation: () => gsap.utils.random(-25, 25),
    duration: 0.45,
    ease: "power2.out",
    stagger: { amount: 0.2, from: "random" }
  });

  // 2. Thu về một tụ chuẩn giữa bàn (Gather to center stack)
  tl.to(cardElements, {
    x: 0,
    y: 0,
    rotation: 0,
    duration: 0.35,
    ease: "back.out(1.2)",
    stagger: 0.015
  });

  // 3. Trải bung hình quạt mượt mà (Fan Out)
  tl.to(cardElements, {
    x: (i) => calculateFanTransform(i, cardElements.length, window.innerWidth < 768).x,
    y: (i) => calculateFanTransform(i, cardElements.length, window.innerWidth < 768).y,
    rotation: (i) => calculateFanTransform(i, cardElements.length, window.innerWidth < 768).rotation,
    duration: 0.65,
    ease: "power3.out",
    stagger: { amount: 0.35, from: "center" }
  });

  return tl;
}
```

### 3.4. CSS 3D Card Flip & Preload Image
Đảm bảo thẻ bài được lật mượt trên GPU và không bao giờ bị flash trắng khi tải ảnh mặt trước:

```css
/* Tailwind hoặc Vanilla CSS Tokens */
.card-scene {
  perspective: 1200px;
}

.card-3d-flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-3d-flipper.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 0.75rem;
  overflow: hidden;
}

.card-back {
  transform: rotateY(0deg);
}

.card-front {
  transform: rotateY(180deg);
}
```

#### Quy tắc Preload Mặt Trước:
```ts
export function preloadCardImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Vẫn resolve để không chặn animation
  });
}
```

---

## 4. Hiển Thị Lời Giải AI (Motion Streaming & Reveal)

Sử dụng Motion để các đoạn văn bản luận giải xuất hiện êm ái theo nhịp đọc, không xuất hiện đột ngột:

```tsx
import { motion } from 'framer-motion'; // hoặc motion/react

export function ReadingReveal({ text, title }: { text: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-amber-500/20 shadow-2xl"
    >
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-serif text-amber-300 mb-3"
      >
        {title}
      </motion.h3>
      <p className="text-slate-200 leading-relaxed font-sans">{text}</p>
    </motion.div>
  );
}
```

---

## 5. Quy Chuẩn Hiệu Năng & 60 FPS Checklist

* [ ] **Chỉ animate `transform` và `opacity`**: Tuyệt đối không animate `top`, `left`, `width`, `height`, `margin`.
* [ ] **Bật Hardware Acceleration**: Luôn gắn `will-change: transform` trên các lá bài đang xào/di chuyển, và gỡ bỏ khi đã đứng yên.
* [ ] **Hạn chế `filter: blur` & Shadow lớn khi di chuyển**: Tắt `box-shadow` động trong quá trình chạy GSAP timeline; chỉ bật glow nhẹ khi bài đã đáp vào khay.
* [ ] **Kiểm tra `prefers-reduced-motion`**: Nếu người dùng bật giảm chuyển động, bỏ qua chuỗi xào và hiển thị trực tiếp khay bài.
* [ ] **Dọn dẹp bộ nhớ GSAP**: Luôn gọi `ctx.revert()` trong `useEffect` / `useLayoutEffect` cleanup để tránh memory leak:
  ```ts
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Setup timeline
    });
    return () => ctx.revert();
  }, []);
  ```
