import { Err, None, Ok, Option, Result, Some } from "../deps.ts";
import { IIdentifiable } from "../Domain/IIdentifiable.ts";

export abstract class BaseRepo<T extends IIdentifiable> {
  private entities: Map<string, T>;

  constructor() {
    this.entities = new Map<string, T>();
  }

  save(entity: T): Result<T, string> {
    if (!this.entities.has(entity.id)) {
      this.entities.set(entity.id, entity);
      return Ok(entity);
    } else {
      return Err("Item already exists with the same name.");
    }
  }

  delete(id: string): boolean {
    return this.entities.delete(id);
  }

  get(id: string): Option<T> {
    const entity = this.entities.get(id);
    if (entity) {
      return Some(entity);
    } else {
      return None;
    }
  }

  update(id: string, entity: T): Result<T, string> {
    if (!this.entities.has(id)) {
      return Err("Item does not exist.");
    } else {
      entity.id = id;
      this.entities.set(id, entity);
      return Ok(entity);
    }
  }
}
