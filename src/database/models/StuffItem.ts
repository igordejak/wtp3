export interface StuffItem {
  id?: number; // Автоматично генерується Dexie, тому необов'язковий для нових записів
  name: string;
  contactInfo?: string | null; // Додано null для узгодженості
  isPerson: boolean;
}