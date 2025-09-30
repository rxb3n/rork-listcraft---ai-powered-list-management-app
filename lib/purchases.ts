import { Platform } from "react-native";

export type RCProduct = {
  identifier: string;
  priceString: string;
};

export type RCPackage = {
  identifier: string;
  product: RCProduct;
};

export type RCOffering = {
  identifier: string;
  availablePackages: RCPackage[];
};

export type RCOfferings = {
  current?: RCOffering | null;
};

export type RCCustomerInfo = {
  entitlements: { active: Record<string, unknown> };
};

type PurchasesLike = {
  configure: (opts: { apiKey: string }) => Promise<void> | void;
  getOfferings: () => Promise<RCOfferings>;
  getCustomerInfo: () => Promise<RCCustomerInfo>;
  purchasePackage: (pkg: RCPackage | string) => Promise<unknown>;
  restorePurchases?: () => Promise<unknown>;
};

function createMockOfferings(): RCOfferings {
  const monthly: RCPackage = {
    identifier: "monthly",
    product: { identifier: "listcraft_pro_monthly", priceString: "$4.99" },
  };
  const p10: RCPackage = {
    identifier: "10_credits",
    product: { identifier: "pack_10_credits", priceString: "€2.99" },
  };
  const p25: RCPackage = {
    identifier: "25_credits",
    product: { identifier: "pack_25_credits", priceString: "€5.99" },
  };
  const p50: RCPackage = {
    identifier: "50_credits",
    product: { identifier: "pack_50_credits", priceString: "€9.99" },
  };
  return {
    current: {
      identifier: "default",
      availablePackages: [monthly, p10, p25, p50],
    },
  };
}

function resolveNative(): { available: boolean; native?: PurchasesLike } {
  try {
    if (Platform.OS === "web") return { available: false };
    const req: (id: string) => unknown = eval("require");
    const mod = req("react-native-purchases") as { default?: PurchasesLike } | PurchasesLike;
    const native = ("default" in mod ? (mod as { default: PurchasesLike }).default : (mod as PurchasesLike));
    if (native && typeof native.getOfferings === "function") {
      return { available: true, native };
    }
    return { available: false };
  } catch (_e) {
    return { available: false };
  }
}

const nativeRef = resolveNative();

const purchases = {
  isAvailable: nativeRef.available,
  async configure(apiKey: string) {
    try {
      if (nativeRef.available && nativeRef.native) {
        const maybePromise = nativeRef.native.configure({ apiKey });
        if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
          await (maybePromise as Promise<void>);
        }
      }
    } catch (e) {
      console.log("Purchases configure failed", e);
    }
  },
  async getOfferings(): Promise<RCOfferings> {
    try {
      if (nativeRef.available && nativeRef.native) {
        return await nativeRef.native.getOfferings();
      }
      return createMockOfferings();
    } catch (e) {
      console.log("Purchases getOfferings failed", e);
      return createMockOfferings();
    }
  },
  async getCustomerInfo(): Promise<RCCustomerInfo> {
    try {
      if (nativeRef.available && nativeRef.native) {
        return await nativeRef.native.getCustomerInfo();
      }
      return { entitlements: { active: {} } };
    } catch (e) {
      console.log("Purchases getCustomerInfo failed", e);
      return { entitlements: { active: {} } };
    }
  },
  async purchasePackage(identifier: string): Promise<{ success: boolean; productId?: string }> {
    try {
      if (nativeRef.available && nativeRef.native) {
        await nativeRef.native.purchasePackage(identifier);
        return { success: true };
      }
      const offerings = createMockOfferings();
      const pkg = offerings.current?.availablePackages.find(p => p.identifier === identifier);
      return { success: !!pkg, productId: pkg?.product.identifier };
    } catch (e) {
      console.log("Purchases purchasePackage failed", e);
      return { success: false };
    }
  },
  async restorePurchases(): Promise<void> {
    try {
      if (nativeRef.available && nativeRef.native && nativeRef.native.restorePurchases) {
        await nativeRef.native.restorePurchases();
      }
    } catch (e) {
      console.log("Purchases restorePurchases failed", e);
    }
  },
};

export default purchases;
