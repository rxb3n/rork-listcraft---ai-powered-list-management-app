import { I18nManager, Platform } from "react-native";

export const supportedLanguages = ["en", "fr", "es", "de", "zh"] as const;
export type Language = (typeof supportedLanguages)[number];

export function detectDeviceLanguage(): Language {
  try {
    const locales = (Intl as unknown as { DateTimeFormat: () => { resolvedOptions: () => { locale: string } } })
      .DateTimeFormat()
      .resolvedOptions().locale;
    const primary = locales.split("-")[0] as Language;
    if (supportedLanguages.includes(primary)) return primary;
  } catch {
    // ignore
  }
  return "en";
}

type Dict = Record<string, string>;

const base: Record<Language, Dict> = {
  en: {
    "create.title": "Craft a list",
    "create.category": "Category",
    "create.describe": "Describe your list",
    "create.describePlaceholder": "e.g. Healthy dinners for the week",
    "create.placeholders.groceries": "Groceries for 2 under $40 – breakfast, lunch, dinner",
    "create.placeholders.recipe": "Ingredients for creamy chicken pasta (4 servings)",
    "create.placeholders.building": "Materials to build a 2x4 bookshelf (tools included)",
    "create.placeholders.workout": "3-day full-body plan with dumbbells (beginner)",
    "create.placeholders.custom": "Trip packing list for a 3-day city break",
    "create.people": "People",
    "create.budget": "Budget",
    "create.generate": "Generate with AI",
    "create.createEmpty": "Create empty",
    "create.helper": "AI uses one credit per generation. You can earn more by watching ads.",

    "categories.groceries": "Groceries",
    "categories.recipe": "Recipe",
    "categories.building": "Building",
    "categories.workout": "Workout",
    "categories.custom": "Custom",

    "ai.generatedTitle": "List created",
    "ai.generatedBody": "Your AI-crafted list is ready.",

    "lists.title": "Your lists",
    "lists.searchPlaceholder": "Search lists",
    "lists.empty": "No lists yet. Create one!",
    "lists.untitled": "Untitled list",
    "lists.createdTitle": "List created",
    "lists.createdBody": "You can manage it in the Lists tab.",
    "lists.copiedTitle": "Copied",
    "lists.copiedBody": "List copied to clipboard",

    "credits.outTitle": "Out of credits",
    "credits.outBody": "Watch an ad to earn +1 credit?",
    "credits.watchAd": "Watch ad",
    "credits.getMore": "Get credits",

    "errors.missingDescriptionTitle": "Add a description",
    "errors.missingDescriptionBody": "Please write a short description.",
    "errors.generalTitle": "Something went wrong",
    "errors.generalBody": "Please try again.",
    "common.cancel": "Cancel",
  },
  fr: {
    "create.title": "Créer une liste",
    "create.category": "Catégorie",
    "create.describe": "Décrivez votre liste",
    "create.describePlaceholder": "ex: Dîners sains pour la semaine",
    "create.placeholders.groceries": "Courses pour 2 sous 40€ – petit-déj, déjeuner, dîner",
    "create.placeholders.recipe": "Ingrédients pour pâtes crémeuses au poulet (4 personnes)",
    "create.placeholders.building": "Matériaux pour une étagère en 2x4 (avec outils)",
    "create.placeholders.workout": "Programme 3 jours full body avec haltères (débutant)",
    "create.placeholders.custom": "Liste de bagages pour 3 jours en ville",
    "create.people": "Personnes",
    "create.budget": "Budget",
    "create.generate": "Générer avec l'IA",
    "create.createEmpty": "Créer vide",
    "create.helper": "L'IA utilise un crédit par génération. Gagnez-en en regardant des pubs.",

    "categories.groceries": "Courses",
    "categories.recipe": "Recette",
    "categories.building": "Bricolage",
    "categories.workout": "Entraînement",
    "categories.custom": "Personnalisé",

    "ai.generatedTitle": "Liste créée",
    "ai.generatedBody": "Votre liste est prête.",

    "lists.title": "Vos listes",
    "lists.searchPlaceholder": "Rechercher des listes",
    "lists.empty": "Aucune liste. Créez-en une !",
    "lists.untitled": "Liste sans titre",
    "lists.createdTitle": "Liste créée",
    "lists.createdBody": "Gérez-la dans l'onglet Listes.",
    "lists.copiedTitle": "Copié",
    "lists.copiedBody": "Liste copiée dans le presse-papiers",

    "credits.outTitle": "Plus de crédits",
    "credits.outBody": "Regarder une pub pour gagner +1 crédit ?",
    "credits.watchAd": "Regarder",
    "credits.getMore": "Obtenir des crédits",

    "errors.missingDescriptionTitle": "Ajoutez une description",
    "errors.missingDescriptionBody": "Veuillez écrire une courte description.",
    "errors.generalTitle": "Une erreur s'est produite",
    "errors.generalBody": "Veuillez réessayer.",
    "common.cancel": "Annuler",
  },
  es: {
    "create.title": "Crear una lista",
    "create.category": "Categoría",
    "create.describe": "Describe tu lista",
    "create.describePlaceholder": "p.ej., Cenas saludables para la semana",
    "create.placeholders.groceries": "Compra para 2 por menos de $40 – desayuno, comida, cena",
    "create.placeholders.recipe": "Ingredientes para pasta cremosa con pollo (4 porciones)",
    "create.placeholders.building": "Materiales para estante con tablas 2x4 (incluye herramientas)",
    "create.placeholders.workout": "Plan de 3 días cuerpo completo con mancuernas (principiante)",
    "create.placeholders.custom": "Lista de viaje para escapada urbana de 3 días",
    "create.people": "Personas",
    "create.budget": "Presupuesto",
    "create.generate": "Generar con IA",
    "create.createEmpty": "Crear vacía",
    "create.helper": "La IA usa un crédito por generación. Gana más viendo anuncios.",

    "categories.groceries": "Compras",
    "categories.recipe": "Receta",
    "categories.building": "Construcción",
    "categories.workout": "Ejercicio",
    "categories.custom": "Personalizada",

    "ai.generatedTitle": "Lista creada",
    "ai.generatedBody": "Tu lista ya está lista.",

    "lists.title": "Tus listas",
    "lists.searchPlaceholder": "Buscar listas",
    "lists.empty": "Aún no hay listas. ¡Crea una!",
    "lists.untitled": "Lista sin título",
    "lists.createdTitle": "Lista creada",
    "lists.createdBody": "Adminístrala en la pestaña Listas.",
    "lists.copiedTitle": "Copiado",
    "lists.copiedBody": "Lista copiada al portapapeles",

    "credits.outTitle": "Sin créditos",
    "credits.outBody": "¿Ver un anuncio para ganar +1 crédito?",
    "credits.watchAd": "Ver",
    "credits.getMore": "Obtener créditos",

    "errors.missingDescriptionTitle": "Agrega una descripción",
    "errors.missingDescriptionBody": "Por favor escribe una breve descripción.",
    "errors.generalTitle": "Algo salió mal",
    "errors.generalBody": "Por favor intenta de nuevo.",
    "common.cancel": "Cancelar",
  },
  de: {
    "create.title": "Erstelle eine Liste",
    "create.category": "Kategorie",
    "create.describe": "Beschreibe deine Liste",
    "create.describePlaceholder": "z. B. Gesunde Abendessen für die Woche",
    "create.placeholders.groceries": "Einkauf für 2 unter 40€ – Frühstück, Mittag, Abend",
    "create.placeholders.recipe": "Zutaten für cremige Hähnchenpasta (4 Portionen)",
    "create.placeholders.building": "Material für ein Regal aus 2x4 (inkl. Werkzeuge)",
    "create.placeholders.workout": "3-Tage-Ganzkörperplan mit Kurzhanteln (Anfänger)",
    "create.placeholders.custom": "Packliste für 3-tägigen Städtetrip",
    "create.people": "Personen",
    "create.budget": "Budget",
    "create.generate": "Mit KI erstellen",
    "create.createEmpty": "Leere Liste",
    "create.helper": "KI verbraucht einen Kredit pro Erstellung. Verdiene mehr durch Werbung.",

    "categories.groceries": "Einkauf",
    "categories.recipe": "Rezept",
    "categories.building": "Bauen",
    "categories.workout": "Workout",
    "categories.custom": "Benutzerdefiniert",

    "ai.generatedTitle": "Liste erstellt",
    "ai.generatedBody": "Deine Liste ist bereit.",

    "lists.title": "Deine Listen",
    "lists.searchPlaceholder": "Listen suchen",
    "lists.empty": "Noch keine Listen. Erstelle eine!",
    "lists.untitled": "Unbenannte Liste",
    "lists.createdTitle": "Liste erstellt",
    "lists.createdBody": "Verwalte sie im Tab Listen.",
    "lists.copiedTitle": "Kopiert",
    "lists.copiedBody": "Liste in die Zwischenablage kopiert",

    "credits.outTitle": "Keine Credits",
    "credits.outBody": "Werbung ansehen für +1 Credit?",
    "credits.watchAd": "Ansehen",
    "credits.getMore": "Guthaben kaufen",

    "errors.missingDescriptionTitle": "Beschreibung hinzufügen",
    "errors.missingDescriptionBody": "Bitte eine kurze Beschreibung schreiben.",
    "errors.generalTitle": "Etwas ist schiefgelaufen",
    "errors.generalBody": "Bitte erneut versuchen.",
    "common.cancel": "Abbrechen",
  },
  zh: {
    "create.title": "创建清单",
    "create.category": "类别",
    "create.describe": "描述你的清单",
    "create.describePlaceholder": "例如：本周健康晚餐",
    "create.placeholders.groceries": "2 人 40 美元以内的杂货——早/午/晚餐",
    "create.placeholders.recipe": "奶油鸡肉意面配料（4 人）",
    "create.placeholders.building": "制作 2x4 书架的材料（含工具）",
    "create.placeholders.workout": "3 天哑铃全身计划（初学者）",
    "create.placeholders.custom": "3 天城市旅行打包清单",
    "create.people": "人数",
    "create.budget": "预算",
    "create.generate": "使用 AI 生成",
    "create.createEmpty": "创建空清单",
    "create.helper": "AI 每次生成消耗 1 点额度。观看广告可获得额度。",

    "categories.groceries": "杂货",
    "categories.recipe": "菜谱",
    "categories.building": "建造",
    "categories.workout": "健身",
    "categories.custom": "自定义",

    "ai.generatedTitle": "清单已创建",
    "ai.generatedBody": "AI 清单已准备好。",

    "lists.title": "你的清单",
    "lists.searchPlaceholder": "搜索清单",
    "lists.empty": "还没有清单，去创建一个吧！",
    "lists.untitled": "未命名清单",
    "lists.createdTitle": "清单已创建",
    "lists.createdBody": "可在“清单”标签管理。",
    "lists.copiedTitle": "已复制",
    "lists.copiedBody": "清单已复制到剪贴板",

    "credits.outTitle": "额度不足",
    "credits.outBody": "观看广告获得 +1 额度？",
    "credits.watchAd": "观看",
    "credits.getMore": "购买额度",

    "errors.missingDescriptionTitle": "请添加描述",
    "errors.missingDescriptionBody": "请写一段简短描述。",
    "errors.generalTitle": "发生错误",
    "errors.generalBody": "请重试。",
    "common.cancel": "取消",
  },
};

export function getTranslator(language: Language) {
  const dict = base[language] ?? base.en;
  return (key: keyof typeof base.en): string => dict[key] ?? (base.en[key] as string);
}