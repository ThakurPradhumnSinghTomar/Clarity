Type vs Interface — Quick Difference
1. Purpose

Interface → best for describing the shape of objects, classes, component props.

Type → more general. Can describe unions, primitives, tuples, objects, etc.

2. Extending

Interface → can be extended multiple times, even across files (open-ended).

interface A { x: number }
interface A { y: string } // works (merges)


Type → cannot be re-opened. Must use intersections:

type A = { x: number }
type A2 = A & { y: string }

3. When to Use Interface

Use interface when:

Defining React props

Defining object shapes

When you want extendable & merge-friendly structures

4. When to Use Type

Use type when:

You need union types (string | number)

You need tuple types ([number, string])

You need primitive aliases (type ID = string)

You want complex compositions

Why Interface for Props?

Interfaces are designed for object shapes, exactly what React props are.

They’re extendable, so future additions are easier.

Code looks cleaner and more standard in React/TS projects:

interface LeaderboardProps {
    students: Student[];
}

Bottom Line

Use interface for props and objects.

Use type for unions, primitives, and advanced compositions.