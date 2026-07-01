// "use client";

// import { create } from "zustand";
// import type { IncomingOrder } from "@/types/verification";

// // سجل العملية
// export interface VerificationRecord {
//   id: string;           // رقم فريد للعملية (بيتولد تلقائي)
//   orderId: string;      // رقم الطلب الأصلي (زي "ORD-4821")
//   citizenName: string;  // اسم المواطن
//   type: string;         // نوع البلاستيك (PET, HDPE)
//   qty: number;          // عدد الزجاجات
//   matchScore: number;   // نسبة تطابق الصور (0-100)
//   result: "verified" | "rejected";  // النتيجة: تم التحقق ✅ أو مرفوض ❌
//   points: number;       // النقاط اللي أخدها المواطن
//   reviewedBy: string;   // مين اللي راجع الطلب
//   timestamp: string;    // وقت العملية
// }
// interface VerificationStoreState {
//   orders: IncomingOrder[];  // الطلبات المستنية
//   history: VerificationRecord[]; // الطلب اللي شغال عليه دلوقتي
//   activeId: string | null; // الطلب اللي شغال عليه دلوقتي
//   resolveOrder: (   // قبول/رفض طلب
//     orderId: string,
//     result: "verified" | "rejected",
//     details: {
//       citizenName: string;
//       type: string;
//       qty: number;
//       matchScore: number;
//       points: number;
//       reviewedBy: string;
//     }
//   ) => void;
//   setOrders: (orders: IncomingOrder[]) => void;  // تحميل طلبات
//   setActive: (id: string | null) => void; // تغيير الطلب النشط
//   deleteRecord: (id: string) => void; // حذف عملية من السجل
// }

// // ========== المتجر البسيط ==========
// export const useVerificationStore = create<VerificationStoreState>((set, get) => ({
//   // ١. الطلبات اللي شغال عليها
//   orders: [],
//   // ٢. السجل (اللي خلص)
//   history: [],
//   // ٣. الطلب النشط
//   activeId: null,

//   // ========== دالة وحدة تعمل كل حاجة ==========
//   resolveOrder: (orderId, result, details) => {
//     const state = get();  // نجيب حالة المتجر الحالية
  
//   // أ. نسجل العملية في السجل
//   const newRecord = {
//     id: Date.now().toString(),  // رقم فريد (الوقت الحالي)
//     orderId: orderId,           // رقم الطلب
//     citizenName: details.citizenName,
//     type: details.type,
//     qty: details.qty,
//     matchScore: details.matchScore,
//     result: result,             // "verified" أو "rejected"
//     points: details.points,
//     reviewedBy: details.reviewedBy,
//     timestamp: new Date().toISOString(),  // الوقت دلوقتي
//   };
    
//     // ب. جيب الطلب اللي بعده
//     const nextOrder = state.orders.find((o) => {
//       return o.id !== orderId && 
//              !state.history.some((h) => h.orderId === o.id);
//     });
    
//     // ج. حدث المتجر
//     set({
//       history: [newRecord, ...state.history],
//       activeId: nextOrder ? nextOrder.id : orderId,
//     });
//   },

//   // ========== دوال بسيطة ==========
//   setOrders: (orders) => set({ 
//     orders, 
//     activeId: orders[0]?.id ?? null
//   }),
  
//   setActive: (id) => set({ activeId: id }),
  
//   deleteRecord: (id) => set((state) => ({
//     history: state.history.filter((r) => r.id !== id),
//   })),
// }));

// // ========== دوال مساعدة (اختيارية) ==========

// // جيب الطلب النشط
// export function useActiveOrder() {
//   const store = useVerificationStore();
//   return store.orders.find((o) => o.id === store.activeId);
// }

// // جيب الإحصائيات
// export function useStats() {
//   const store = useVerificationStore();
//   return {
//     pending: store.orders.filter((o) => 
//       !store.history.some((h) => h.orderId === o.id)
//     ).length,
//     verified: store.history.filter((h) => h.result === "verified").length,
//     rejected: store.history.filter((h) => h.result === "rejected").length,
//   };
// }


// "use client";

// import { create } from "zustand";
// import type { IncomingOrder } from "@/types/verification";

// // سجل العملية
// export interface VerificationRecord {
//   id: string;           // رقم فريد للعملية
//   orderId: string;      // رقم الطلب الأصلي (زي "ORD-4821")
//   citizenName: string;  // اسم المواطن
//   type: string;         // نوع البلاستيك (PET, HDPE)
//   qty: number;          // عدد الزجاجات
//   matchScore: number;   // نسبة تطابق الصور (0-100)
//   result: "verified" | "rejected";  // النتيجة: تم التحقق ✅ أو مرفوض ❌
//   points: number;       // النقاط اللي أخدها المواطن
//   reviewedBy: string;   // مين اللي راجع الطلب
//   timestamp: string;    // وقت العملية
// }

// interface VerificationStoreState {
//   orders: IncomingOrder[];
//   history: VerificationRecord[];
//   activeId: string | null;
  
//   // دالة واحدة تعمل كل حاجة (الاسم الجديد)
//   resolve: (orderId: string, result: "verified" | "rejected") => void;
//   // دالة متوافقة مع صفحة التحقق (الاسم القديم)
//   resolveOrder: (
//     orderId: string,
//     result: "verified" | "rejected",
//     details: {
//       citizenName: string;
//       type: string;
//       qty: number;
//       matchScore: number;
//       points: number;
//       reviewedBy: string;
//     }
//   ) => void;

//   setOrders: (orders: IncomingOrder[]) => void;
//   loadOrders: (orders: IncomingOrder[]) => void;
//   setActive: (id: string | null) => void;
//   deleteRecord: (id: string) => void;
// }

// // ========== المتجر البسيط ==========
// export const useVerificationStore = create<VerificationStoreState>((set, get) => ({
//   orders: [],
//   history: [],
//   activeId: null,

//   // دالة واحدة تعمل كل حاجة
//   resolve: (orderId, result) => {
//     const { orders, history } = get();
//     const order = orders.find(o => o.id === orderId);
//     if (!order) return;

//     const newRecord: VerificationRecord = {
//       id: Date.now().toString(),
//       orderId: order.id,
//       citizenName: order.citizenName,
//       type: order.expectedType,
//       qty: order.expectedQty,
//       matchScore: result === "verified" ? 95 : 20,
//       result: result,
//       points: result === "verified" ? order.pointsToAward : 0,
//       reviewedBy: "Admin",
//       timestamp: new Date().toISOString(),
//     };

//     const nextOrder = orders.find((o) => {
//       return o.id !== orderId && !history.some((h) => h.orderId === o.id);
//     });

//     set({
//       history: [...history, newRecord],
//       activeId: nextOrder ? nextOrder.id : orderId,
//     });
//   },

//   // قبول/رفض طلب بالتفاصيل الكاملة
//   resolveOrder: (orderId, result, details) => {
//     const { orders, history } = get();

//     const newRecord: VerificationRecord = {
//       id: Date.now().toString(),
//       orderId: orderId,
//       citizenName: details.citizenName,
//       type: details.type,
//       qty: details.qty,
//       matchScore: details.matchScore,
//       result: result,
//       points: details.points,
//       reviewedBy: details.reviewedBy,
//       timestamp: new Date().toISOString(),
//     };

//     const nextOrder = orders.find((o) => {
//       return o.id !== orderId && !history.some((h) => h.orderId === o.id);
//     });

//     set({
//       history: [newRecord, ...history],
//       activeId: nextOrder ? nextOrder.id : orderId,
//     });
//   },

//   // تحميل طلبات
//   setOrders: (newOrders) => set({ 
//     orders: newOrders, 
//     activeId: newOrders[0]?.id ?? null 
//   }),
  
//   loadOrders: (newOrders) => set({ 
//     orders: newOrders, 
//     activeId: newOrders[0]?.id ?? null 
//   }),
  
//   setActive: (id) => set({ activeId: id }),
  
//   deleteRecord: (id) => set((state) => ({
//     history: state.history.filter((r) => r.id !== id),
//   })),
// }));

// // ========== دوال مساعدة ==========

// // جيب الطلب النشط
// export function useActiveOrder() {
//   const store = useVerificationStore();
//   return store.orders.find((o) => o.id === store.activeId) || null;
// }

// // جيب الإحصائيات
// export function useStats() {
//   const store = useVerificationStore();
//   return {
//     pending: store.orders.filter((o) => 
//       !store.history.some((h) => h.orderId === o.id)
//     ).length,
//     verified: store.history.filter((h) => h.result === "verified").length,
//     rejected: store.history.filter((h) => h.result === "rejected").length,
//   };
// }

// /*
// // ========== طريقة الاستخدام الصحيحة داخل المكونات (React Components) ==========
// function ExampleComponent() {
//   const store = useVerificationStore();
  
//   // تحميل طلبات
//   // store.loadOrders([...]);
  
//   // قبول طلب
//   // store.resolve("ORD-4821", "verified");
  
//   // قراءة البيانات
//   // store.orders
//   // store.history
// }
// */



"use client";

import { create } from "zustand";
import type { IncomingOrder } from "@/types/verification";

export interface VerificationRecord {
  orderId: string;
  citizenName: string;
  type: string;
  qty: number;
  matchScore: number;
  result: "verified" | "rejected";
  points: number;
  reviewedBy: string;
  timestamp: string;
}

interface VerificationStoreState {
  orders: IncomingOrder[];
  history: VerificationRecord[];
  activeId: string | null;
  
  resolve: (orderId: string, result: "verified" | "rejected") => void;
  load: (orders: IncomingOrder[]) => void;
  setActive: (id: string | null) => void;
}

// ========== المتجر البسيط ==========
export const useVerificationStore = create<VerificationStoreState>((set, get) => ({
  orders: [],     // الطلبات
  history: [],    // السجل
  activeId: null, // الطلب النشط المحدد يدوياً

  // قبول أو رفض طلب
  resolve: (orderId, result) => {
    const { orders, history } = get();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    set({
      history: [...history, {
        orderId,
        citizenName: order.citizenName,
        type: order.expectedType,
        qty: order.expectedQty,
        matchScore: result === "verified" ? 95 : 0,
        result,
        points: result === "verified" ? order.pointsToAward : 0,
        reviewedBy: "Admin",
        timestamp: new Date().toISOString(),
      }],
      // عند الحل، تصفير التحديد اليدوي ليعود تلقائياً لأول طلب غير محلول
      activeId: null
    });
  },

  // تحميل طلبات
  load: (orders) => set({ orders }),

  // تحديد الطلب النشط
  setActive: (id) => set({ activeId: id }),
}));

// أول طلب لسه متحلش (أو المحدد يدوياً بشرط ألا يكون قد حُلّ بعد)
export const useActiveOrder = () => {
  const { orders, history, activeId } = useVerificationStore();
  const firstUnsolved = orders.find(o => !history.some(h => h.orderId === o.id)) || null;

  if (activeId) {
    const isResolved = history.some(h => h.orderId === activeId);
    if (!isResolved) {
      const selected = orders.find(o => o.id === activeId);
      if (selected) return selected;
    }
  }
  
  return firstUnsolved;
};

// إحصائيات
export const useStats = () => {
  const { orders, history } = useVerificationStore();
  const pending = orders.filter(o => !history.some(h => h.orderId === o.id)).length;
  const verified = history.filter(h => h.result === "verified").length;
  const rejected = history.filter(h => h.result === "rejected").length;
  return { pending, verified, rejected };
};