import * as borsh from '@project-serum/borsh'
const BN = require('bn.js');

export class Movies {
  title: string;
  rating: number;
  description: string;

  constructor(title: string, rating: number, description: string) {
    this.title = title;
    this.rating = rating;
    this.description = description;

  }

  static mocks: Movies[] = [
    new Movies('The Shawshank Redemption', 5, `For a movie shot entirely in prison where there is no hope at all, shawshank redemption's main massage and purpose is to remind us of hope, that even in the darkest places hope exists, and only needs someone to find it. Combine this message with a brilliant screenplay, lovely characters and Martin freeman, and you get a movie that can teach you a lesson everytime you watch it. An all time Classic!!!`),
    new Movies('The Godfather', 5, `One of Hollywood's greatest critical and commercial successes, The Godfather gets everything right; not only did the movie transcend expectations, it established new benchmarks for American cinema.`),
    new Movies('The Godfather: Part II', 4, `The Godfather: Part II is a continuation of the saga of the late Italian-American crime boss, Francis Ford Coppola, and his son, Vito Corleone. The story follows the continuing saga of the Corleone family as they attempt to successfully start a new life for themselves after years of crime and corruption.`),
    new Movies('The Dark Knight', 5, `The Dark Knight is a 2008 superhero film directed, produced, and co-written by Christopher Nolan. Batman, in his darkest hour, faces his greatest challenge yet: he must become the symbol of the opposite of the Batmanian order, the League of Shadows.`),
  ]

  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('title'),
    borsh.u8('rating'),
    borsh.str('description'),
  ])

  // notice this serialize method varinat is 0
  serialize_create(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  serialize_update(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, variant: 1 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  serialize_delete(): Buffer {
    const buffer = Buffer.alloc(1000)
    this.borshInstructionSchema.encode({ ...this, variant: 2 }, buffer)
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
  }

  static borshAccountSchema = borsh.struct([
    borsh.bool('initialized'),
    borsh.str('title'),
    borsh.u8('rating'),
    borsh.str('description'),
  ])

  static deserialize(buffer?: Buffer): Movies | null {
    if (!buffer) {
      return null
    }

    try {
      const { title, rating, description } = this.borshAccountSchema.decode(buffer)
      return new Movies(title, rating, description)
    } catch (error) {
      console.log('Deserialization error:', error)
      return null
    }
  }
}
