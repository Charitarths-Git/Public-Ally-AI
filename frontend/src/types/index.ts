export type CategoryType = 'government' | 'political' | 'company' | 'organization' | null;

export interface UserSession {
  category: CategoryType;
  subcategory: string;
  username: string;
  theme: 'governance' | 'corporate';
}
