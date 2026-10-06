---
title: "代码块压力测试：194 行行号对齐验证"
title_en: "Codeblock Stress Test: 160-line Number Alignment"
date: "2026-10-06"
category: "tech"
tags: ["测试", "TypeScript", "代码块"]
featured: false
draft: false
---

这篇文章专门用来验证代码块的**行号对齐**与**白天/黑夜双主题渲染**。下面是一个 194 行的 TypeScript 类型安全事件总线实现，包含注释、字符串、关键字、泛型、数字等多种 token 类型。请在白天与黑夜模式下分别查看：白天模式应为浅色背景 + 深色文字，黑夜模式为深色背景 + 浅色文字，两者不应混淆。

<!-- more -->

## 完整实现（194 行）

把下面这块代码从第 1 行滚动到最后一行，检查每一行的行号是否与代码行精确水平对齐，尤其是 100 行之后的三位数行号区域。

```ts
/**
 * TypeSafeEventBus - 一个类型安全的事件总线实现
 * 用于验证代码块渲染: 行号对齐 / 双主题 token 配色
 */

/** 事件名称到事件负载的类型映射 */
export interface EventMap {
  'user:login': { userId: number; timestamp: number };
  'user:logout': { reason: string };
  'cart:update': { itemIds: string[]; total: number };
  'notify': { level: 'info' | 'warn' | 'error'; message: string };
}

type EventName = keyof EventMap;

/** 单个订阅者的包装 */
interface Subscription {
  id: number;
  once: boolean;
  handler: (payload: never) => void;
}

const MAX_LISTENERS = 128;
const WILDCARD = '*';

export class TypeSafeEventBus {
  private listeners = new Map<string, Set<Subscription>>();
  private nextId = 1;
  private history: string[] = [];

  constructor(private readonly debug = false) {
    if (this.debug) {
      console.log('[EventBus] initialized');
    }
  }

  /** 订阅事件, 返回取消订阅函数 */
  on<K extends EventName>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): () => void {
    this.assertCapacity(event);
    const subscription: Subscription = {
      id: this.nextId++,
      once: false,
      handler: handler as (payload: never) => void,
    };
    this.register(event, subscription);
    return () => this.unregister(event, subscription.id);
  }

  /** 订阅一次, 触发后自动取消 */
  once<K extends EventName>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): () => void {
    this.assertCapacity(event);
    const subscription: Subscription = {
      id: this.nextId++,
      once: true,
      handler: handler as (payload: never) => void,
    };
    this.register(event, subscription);
    return () => this.unregister(event, subscription.id);
  }

  /** 发布事件, 依次调用所有订阅者 */
  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    this.history.push(`${event}@${Date.now()}`);
    if (this.history.length > 50) {
      this.history.shift();
    }

    const set = this.listeners.get(event);
    if (!set || set.size === 0) {
      if (this.debug) {
        console.warn(`[EventBus] no listener for "${event}"`);
      }
      return;
    }

    // 复制一份, 避免回调中增删订阅导致的迭代错乱
    const snapshot = Array.from(set);
    for (const subscription of snapshot) {
      try {
        (subscription.handler as (p: EventMap[K]) => void)(payload);
      } catch (error) {
        console.error(`[EventBus] handler #${subscription.id} threw:`, error);
      }
      if (subscription.once) {
        this.unregister(event, subscription.id);
      }
    }
  }

  /** 移除某个事件的所有订阅 */
  removeAllListeners(event?: EventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /** 当前订阅数量统计 */
  listenerCount(event?: EventName): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }
    let total = 0;
    for (const set of this.listeners.values()) {
      total += set.size;
    }
    return total;
  }

  /** 最近发布的事件名(调试用) */
  recentEvents(limit = 10): string[] {
    return this.history.slice(-limit);
  }

  private register(event: string, subscription: Subscription): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set<Subscription>();
      this.listeners.set(event, set);
    }
    set.add(subscription);
    if (this.debug) {
      console.log(`[EventBus] +${event} (#${subscription.id})`);
    }
  }

  private unregister(event: string, id: number): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    for (const subscription of set) {
      if (subscription.id === id) {
        set.delete(subscription);
        break;
      }
    }
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  private assertCapacity(event: string): void {
    const size = this.listeners.get(event)?.size ?? 0;
    if (size >= MAX_LISTENERS) {
      throw new RangeError(
        `Too many listeners for "${event}": ${size} >= ${MAX_LISTENERS}`
      );
    }
  }
}

// ---------- 使用示例 ----------

interface CartItem {
  id: string;
  title: string;
  price: number;
}

const bus = new TypeSafeEventBus(true);
const cart: CartItem[] = [];

bus.on('user:login', ({ userId, timestamp }) => {
  const date = new Date(timestamp).toISOString();
  console.log(`user #${userId} logged in at ${date}`);
});

bus.on('cart:update', ({ itemIds, total }) => {
  console.log(`cart: ${itemIds.length} items, total ¥${total.toFixed(2)}`);
});

bus.once('notify', ({ level, message }) => {
  if (level !== 'info') {
    console.error(`[${level}] ${message}`);
  }
});

bus.emit('user:login', { userId: 42, timestamp: Date.now() });
cart.push({ id: 'sku-1001', title: '机械键盘', price: 399 });
bus.emit('cart:update', {
  itemIds: cart.map(item => item.id),
  total: cart.reduce((sum, item) => sum + item.price, 0),
});
bus.emit('notify', { level: 'warn', message: '库存不足' });

export default TypeSafeEventBus;
```

## 验证要点

1. **行号水平对齐**：任意一行，行号的垂直中心应与该行代码的垂直中心完全一致，滚动到 100 行以后的三位数区域同样成立；
2. **白天模式**：代码块整体为浅色（米白）背景，文字为深色，注释呈灰色但清晰可读，不应出现深色背景；
3. **黑夜模式**：代码块为深色背景、浅色文字；
4. **主题切换**：右上角切换主题后，代码块配色应即时跟随页面切换。
