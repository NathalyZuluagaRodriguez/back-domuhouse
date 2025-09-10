import "express-session";

declare module "express-session" {
  interface SessionData {
    person_id?: number;
  }
}
