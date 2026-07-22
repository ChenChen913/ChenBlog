---
title: "TypeScript 高级类型指南"
title_en: "Advanced TypeScript Types Guide"
date: "2024-06-05"
category: "tech"
tags: ["TypeScript", "JavaScript", "Frontend"]
featured: false
gem: false
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
---

掌握 TypeScript 的高级类型，如条件类型、映射类型、模板字面量类型，能让你写出更安全、更灵活的代码。

## 条件类型

条件类型允许我们根据条件选择不同的类型。

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
```

## 映射类型

映射类型允许我们基于一个旧类型创建一个新类型。

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface User {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<User>;
```

## 模板字面量类型

模板字面量类型允许我们使用字符串字面量来构建新的字符串类型。

```typescript
type World = "world";
type Greeting = `hello ${World}`; // "hello world"
```

## 总结

高级类型是 TypeScript 的强大特性之一，熟练掌握它们将大大提高你的开发效率和代码质量。
