import { v4 as uuid } from 'uuid'

export class UniqueEntityId {
  private readonly value: string

  constructor(id?: string) {
    this.value = id ?? uuid()
  }

  toString(): string {
    return this.value
  }

  equals(id: UniqueEntityId): boolean {
    return this.value === id.value
  }
}