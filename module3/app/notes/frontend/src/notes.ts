import * as borsh from '@project-serum/borsh'
const BN = require('bn.js');

export class Notes {
  id: number;
  title: string;
  body: string;

  constructor(id: number, title: string, body: string) {
    this.id = id;
    this.title = title;
    this.body = body;
  }

  static mocks: Notes[] = [
    new Notes(5, 'The Shawshank Redemption', `For a movie shot entirely in prison where there is no hope at all, shawshank redemption's main massage and purpose is to remind us of hope, that even in the darkest places hope exists, and only needs someone to find it. Combine this message with a brilliant screenplay, lovely characters and Martin freeman, and you get a movie that can teach you a lesson everytime you watch it. An all time Classic!!!`),
    new Notes(5, 'The Godfather', `One of Hollywood's greatest critical and commercial successes, The Godfather gets everything right; not only did the movie transcend expectations, it established new benchmarks for American cinema.`),
    new Notes(4, 'The Godfather: Part II', `The Godfather: Part II is a continuation of the saga of the late Italian-American crime boss, Francis Ford Coppola, and his son, Vito Corleone. The story follows the continuing saga of the Corleone family as they attempt to successfully start a new life for themselves after years of crime and corruption.`),
    new Notes(5, 'The Dark Knight', `The Dark Knight is a 2008 superhero film directed, produced, and co-written by Christopher Nolan. Batman, in his darkest hour, faces his greatest challenge yet: he must become the symbol of the opposite of the Batmanian order, the League of Shadows.`),
  ]

  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.u64('id'),
    borsh.str('title'),
    borsh.str('body'),
  ])

  // notice this serialize method varinat is 0
  serialize_create(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, id: new BN(this.id, 10), variant: 0 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  serialize_update(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, id: new BN(this.id, 10), variant: 1 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  serialize_delete(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, id: new BN(this.id, 10), variant: 2 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  static borshAccountSchema = borsh.struct([
    borsh.bool('initialized'),
    borsh.u8('id'),
    borsh.str('title'),
    borsh.str('body'),
  ])

  static deserialize(buffer?: Buffer): Notes | null {
    if (!buffer) {
      return null
    }

    try {
      const { id, title, body } = this.borshAccountSchema.decode(buffer)
      return new Notes(id, title, body)
    } catch (error) {
      console.log('Deserialization error:', error)
      return null
    }
  }
}
