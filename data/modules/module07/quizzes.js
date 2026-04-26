Object.assign(QUIZZES, {
  'ch41': {
    title: 'Chapter 41 Quiz: Generics',
    questions: [
      {
        q: 'What is the main benefit of using generics in Rust?',
        options: [
          'They make code run faster at runtime by skipping type checks',
          'They let you write one function or struct that works with many types without code duplication',
          'They allow types to be changed at runtime',
          'They automatically implement all traits for a type'
        ],
        answer: 1,
        explanation: 'Generics let you write a single definition that works for multiple types, eliminating code duplication while keeping full type safety.'
      },
      {
        q: 'What does Rust do with generic code at compile time?',
        options: [
          'It boxes all generic values on the heap',
          'It erases types and uses runtime reflection',
          'It performs monomorphization, generating a concrete copy for each type used',
          'It converts all generic functions to dynamic dispatch'
        ],
        answer: 2,
        explanation: 'Monomorphization means Rust stamps out a concrete version of a generic function for each type it is called with, resulting in zero runtime cost.'
      },
      {
        q: 'Which syntax correctly defines a generic function that finds the largest value?',
        options: [
          'fn largest(list: &[T]) -> &T { ... }',
          'fn largest<T: PartialOrd>(list: &[T]) -> &T { ... }',
          'fn largest<T>(list: &[T]) -> &T where T: Copy { ... }',
          'fn largest[T](list: &[T]) -> &T { ... }'
        ],
        answer: 1,
        explanation: 'The correct syntax uses angle brackets after the function name. The PartialOrd bound is required to use the > operator for comparison.'
      },
      {
        q: 'Given struct Point<T> { x: T, y: T }, which of these is valid?',
        options: [
          'let p = Point { x: 1, y: 2.5 };',
          'let p = Point { x: 1, y: 2 };',
          'let p = Point<i32> { x: 1, y: 2 };',
          'let p = Point { x: "hello", y: 42 };'
        ],
        answer: 1,
        explanation: 'Point<T> uses one type parameter for both x and y, so both fields must be the same type. Point { x: 1, y: 2 } works because both are integers.'
      },
      {
        q: 'Which statement about monomorphization is true?',
        options: [
          'It increases binary size because the compiler generates multiple copies',
          'It slows down the program because extra work happens at runtime',
          'It means generic code is always slower than concrete code',
          'It requires the programmer to manually write each concrete version'
        ],
        answer: 0,
        explanation: 'Monomorphization produces fast code (no runtime overhead) but can increase binary size since the compiler emits one copy per concrete type used.'
      }
    ]
  },

  'ch42': {
    title: 'Chapter 42 Quiz: Trait Definitions',
    questions: [
      {
        q: 'What is a trait in Rust most similar to?',
        options: [
          'A concrete struct with its own data',
          'A shared behavior contract that types can implement',
          'A runtime type check mechanism',
          'A module for organizing code'
        ],
        answer: 1,
        explanation: 'A trait defines a set of method signatures (a contract). Any type that implements the trait agrees to provide those behaviors.'
      },
      {
        q: 'What is the orphan rule?',
        options: [
          'You cannot implement a trait for a type if neither the trait nor the type is defined in your crate',
          'Traits cannot have default method implementations',
          'A type can only implement one trait at a time',
          'Traits defined outside your crate cannot have associated types'
        ],
        answer: 0,
        explanation: 'The orphan rule prevents conflicting implementations: you can only implement a foreign trait on a local type, or a local trait on a foreign type.'
      },
      {
        q: 'Which keyword is used to provide a default method body in a trait definition?',
        options: [
          'No special keyword; just write the body inside the trait block',
          'default fn method_name() { ... }',
          'impl fn method_name() { ... }',
          'override fn method_name() { ... }'
        ],
        answer: 0,
        explanation: 'Default method bodies are written directly in the trait block without any extra keyword. Types can override them in their impl block.'
      },
      {
        q: 'Given: trait Greet { fn hello(&self) -> String; } How do you implement it for struct Dog?',
        options: [
          'impl Dog for Greet { fn hello(&self) -> String { String::from("Woof") } }',
          'impl Greet for Dog { fn hello(&self) -> String { String::from("Woof") } }',
          'trait Greet for Dog { fn hello(&self) -> String { String::from("Woof") } }',
          'Dog::impl Greet { fn hello(&self) -> String { String::from("Woof") } }'
        ],
        answer: 1,
        explanation: 'The correct syntax is `impl TraitName for TypeName { ... }`. The trait name comes first, the type name comes after `for`.'
      },
      {
        q: 'What does `Self` refer to inside a trait definition?',
        options: [
          'The trait itself',
          'The parent module',
          'The concrete type that is implementing the trait',
          'A special instance variable'
        ],
        answer: 2,
        explanation: '`Self` is a placeholder for whichever type ends up implementing the trait. It lets you write methods that return or use the implementing type.'
      }
    ]
  },

  'ch43': {
    title: 'Chapter 43 Quiz: Trait Bounds',
    questions: [
      {
        q: 'What does the following function signature mean? fn notify(item: &impl Summary)',
        options: [
          'item must be the Summary struct',
          'item can be any type that implements the Summary trait',
          'item is a dynamic trait object',
          'item must implement both Summary and Display'
        ],
        answer: 1,
        explanation: '`impl Trait` in parameter position means "any type that implements this trait." It is sugar for a generic with a trait bound.'
      },
      {
        q: 'Which where clause correctly rewrites: fn foo<T: Display + Clone, U: Debug>(t: T, u: U)?',
        options: [
          'fn foo<T, U>(t: T, u: U) where T: Display, T: Clone, U: Debug',
          'fn foo<T, U>(t: T, u: U) where T: Display + Clone, U: Debug',
          'fn foo(t: impl Display + Clone, u: impl Debug)',
          'Both A and B are correct'
        ],
        answer: 3,
        explanation: 'Both A (separate where clauses per bound) and B (combined with + in where) are valid syntax. Option C is also equivalent using impl Trait syntax.'
      },
      {
        q: 'What is a blanket implementation?',
        options: [
          'An implementation that only applies to one specific type',
          'An implementation of a trait for any type that satisfies certain bounds',
          'An implementation that overrides all methods in a trait',
          'An implementation inside an unsafe block'
        ],
        answer: 1,
        explanation: 'A blanket implementation uses `impl<T: SomeBound> SomeTrait for T`, applying to all types meeting the bound. The standard library uses this for ToString.'
      },
      {
        q: 'What does `-> impl Summary` in a function return type mean?',
        options: [
          'The function returns a Box containing a Summary trait object',
          'The function returns some concrete type that implements Summary, without naming the type',
          'The function can return different types at runtime as long as each implements Summary',
          'The function returns the Summary trait itself'
        ],
        answer: 1,
        explanation: '`-> impl Trait` means the return type implements Trait, but the caller does not know the exact type. The concrete type is fixed at compile time.'
      },
      {
        q: 'Which syntax adds multiple trait bounds to a generic type T?',
        options: [
          'T: Display, Clone',
          'T: Display & Clone',
          'T: Display + Clone',
          'T: (Display, Clone)'
        ],
        answer: 2,
        explanation: 'Multiple trait bounds are combined with `+`. For example `T: Display + Clone` means T must implement both Display and Clone.'
      }
    ]
  },

  'ch44': {
    title: 'Chapter 44 Quiz: Associated Types',
    questions: [
      {
        q: 'Where does an associated type appear in Rust?',
        options: [
          'Inside a struct definition',
          'Inside a trait definition, using the `type` keyword',
          'Inside a function body',
          'Inside a module declaration'
        ],
        answer: 1,
        explanation: 'Associated types are declared inside trait definitions with `type TypeName;`. Implementors provide the concrete type in their `impl` block.'
      },
      {
        q: 'What is the associated type in the Iterator trait?',
        options: [
          'type Value',
          'type Output',
          'type Item',
          'type Element'
        ],
        answer: 2,
        explanation: 'The Iterator trait declares `type Item`, which represents the type of values the iterator yields when `next()` is called.'
      },
      {
        q: 'What is the key difference between an associated type and a generic type parameter in a trait?',
        options: [
          'Associated types are faster at runtime',
          'With a generic parameter a type can implement the trait multiple times with different types; with an associated type only one implementation is allowed',
          'Associated types must always be primitive types',
          'Generic parameters cannot be used in trait definitions'
        ],
        answer: 1,
        explanation: 'A generic trait like `Trait<T>` allows multiple implementations per type (e.g., `impl Trait<i32>` and `impl Trait<String>`). An associated type locks in one choice per implementor.'
      },
      {
        q: 'How do you implement the Iterator trait for a struct Counter that yields u32 values?',
        options: [
          'impl Iterator<u32> for Counter { fn next(&mut self) -> Option<u32> { ... } }',
          'impl Iterator for Counter { type Item = u32; fn next(&mut self) -> Option<u32> { ... } }',
          'impl Counter: Iterator { type Item = u32; fn next(&mut self) -> Option<u32> { ... } }',
          'impl Iterator for Counter<u32> { fn next(&mut self) -> Option<u32> { ... } }'
        ],
        answer: 1,
        explanation: 'You implement Iterator for Counter and set `type Item = u32;` inside the impl block. The `next` method then returns `Option<Self::Item>`.'
      },
      {
        q: 'How do you refer to the associated type of a generic T that implements Iterator in a function signature?',
        options: [
          'T.Item',
          'T::Item',
          'T<Item>',
          'Iterator::Item<T>'
        ],
        answer: 1,
        explanation: 'Associated types are accessed with the `::` path syntax. `T::Item` refers to the Item associated type of whatever concrete type T is.'
      }
    ]
  },

  'ch45': {
    title: 'Chapter 45 Quiz: Trait Objects',
    questions: [
      {
        q: 'What keyword is used to create a trait object in Rust?',
        options: ['impl', 'dyn', 'trait', 'ref'],
        answer: 1,
        explanation: '`dyn Trait` creates a trait object. The `dyn` keyword signals that the concrete type is determined at runtime via dynamic dispatch.'
      },
      {
        q: 'Why is Box<dyn Draw> needed instead of just dyn Draw in most cases?',
        options: [
          'Trait objects must always be boxed by language rules',
          'dyn Draw has unknown size at compile time, so it must be behind a pointer like Box or &',
          'Box automatically implements the Draw trait',
          'dyn Draw cannot be stored in a Vec without boxing'
        ],
        answer: 1,
        explanation: 'Trait objects are dynamically sized types (DSTs) with unknown size at compile time. They must be stored behind a pointer (Box, &, Arc, etc.) so the size is known.'
      },
      {
        q: 'What is the main advantage of a Vec<Box<dyn Animal>> over a generic approach?',
        options: [
          'It is faster because it avoids monomorphization',
          'It allows storing different concrete types (Dog, Cat, Fish) in the same collection',
          'It uses less memory than generic collections',
          'It prevents the orphan rule from applying'
        ],
        answer: 1,
        explanation: 'A Vec with trait objects can hold a mix of different concrete types as long as they all implement the same trait. A generic Vec<T> can only hold one type.'
      },
      {
        q: 'Which of these makes a trait NOT object-safe?',
        options: [
          'The trait has a method that takes &self',
          'The trait has a method that returns Self',
          'The trait has default method implementations',
          'The trait inherits from another trait'
        ],
        answer: 1,
        explanation: 'A method returning `Self` is not object-safe because the compiler cannot know the size of the concrete type at the call site when using dynamic dispatch.'
      },
      {
        q: 'What happens at runtime when a method is called on a Box<dyn Trait>?',
        options: [
          'The compiler inlines the call for performance',
          'The program looks up the correct method in a vtable and calls it',
          'The Box is unwrapped and the method is called directly',
          'A runtime error occurs if the wrong type is inside the Box'
        ],
        answer: 1,
        explanation: 'Trait objects use a vtable: a table of function pointers. At runtime the program reads the correct function pointer from the vtable and calls it.'
      }
    ]
  },

  'ch46': {
    title: 'Chapter 46 Quiz: Static vs Dynamic Dispatch',
    questions: [
      {
        q: 'What is static dispatch?',
        options: [
          'The compiler generates one generic function used by all types at runtime',
          'The compiler generates a separate concrete copy of a function for each type it is called with',
          'The program decides which function to call by inspecting types at runtime',
          'Functions declared with the static keyword'
        ],
        answer: 1,
        explanation: 'Static dispatch uses monomorphization: the compiler generates one concrete function per type, eliminating any runtime overhead.'
      },
      {
        q: 'What is the runtime cost of a virtual method call through a trait object (dynamic dispatch)?',
        options: [
          'Zero, same as static dispatch',
          'One heap allocation per call',
          'A vtable lookup (pointer indirection) plus the method call',
          'A full type scan of all implementations'
        ],
        answer: 2,
        explanation: 'Dynamic dispatch requires reading a function pointer from the vtable (one indirection) and then calling through it. This prevents some compiler optimizations like inlining.'
      },
      {
        q: 'What is a "fat pointer" in the context of trait objects?',
        options: [
          'A pointer that has been padded to align to 64 bytes',
          'A two-word pointer: one word pointing to the data, one word pointing to the vtable',
          'A Box pointer that owns its allocation',
          'A raw pointer with relaxed safety rules'
        ],
        answer: 1,
        explanation: 'A trait object reference (&dyn Trait or Box<dyn Trait>) is a fat pointer: two machine words storing a pointer to the data and a pointer to the vtable.'
      },
      {
        q: 'When should you prefer dynamic dispatch over static dispatch?',
        options: [
          'When you want maximum performance in hot loops',
          'When you need to store different types in the same collection or return different types from one function',
          'When the trait has no methods',
          'When the trait is object-safe and the type is known at compile time'
        ],
        answer: 1,
        explanation: 'Dynamic dispatch is the right tool when you need runtime flexibility: mixing types in a Vec, plugin systems, or returning one of several types from a factory function.'
      },
      {
        q: 'Which statement about monomorphization and binary size is correct?',
        options: [
          'Monomorphization always produces smaller binaries than dynamic dispatch',
          'Monomorphization can increase binary size because the compiler emits one copy per concrete type',
          'Dynamic dispatch produces larger binaries because vtables are large',
          'Binary size is not affected by the choice between static and dynamic dispatch'
        ],
        answer: 1,
        explanation: 'Each monomorphized copy adds code to the binary. When a generic is used with many types, the binary grows. Dynamic dispatch uses one shared copy at the cost of a vtable indirection.'
      }
    ]
  },

  'ch47': {
    title: 'Chapter 47 Quiz: Operator Overloading',
    questions: [
      {
        q: 'Which module contains the traits used for operator overloading in Rust?',
        options: ['std::fmt', 'std::ops', 'std::cmp', 'std::convert'],
        answer: 1,
        explanation: '`std::ops` contains traits like Add, Sub, Mul, Div, Neg, and Index that correspond to Rust operators. Implementing them overloads the operator for your type.'
      },
      {
        q: 'What associated type must you set when implementing std::ops::Add?',
        options: ['type Result', 'type Sum', 'type Output', 'type Value'],
        answer: 2,
        explanation: 'The Add trait requires `type Output`, which specifies the type returned by the `+` operation. For `Point + Point` returning `Point`, set `type Output = Point`.'
      },
      {
        q: 'Which trait do you implement to make a type printable with the {} format specifier?',
        options: ['std::fmt::Debug', 'std::fmt::Display', 'std::fmt::Write', 'std::fmt::LowerHex'],
        answer: 1,
        explanation: 'std::fmt::Display is used for user-facing formatting with `{}`. std::fmt::Debug is for developer debugging with `{:?}` and can be derived.'
      },
      {
        q: 'Which trait enables == and != comparisons between values?',
        options: ['Ord', 'PartialOrd', 'Eq', 'PartialEq'],
        answer: 3,
        explanation: 'PartialEq provides the eq() method, which powers the == and != operators. Eq is a marker trait that says the equality relation is total (reflexive, symmetric, transitive).'
      },
      {
        q: 'You implement Add for Point so that Point + Point returns Point. What happens if you write Point + 5?',
        options: [
          'It works because integers can be coerced to Point',
          'It results in a compile error because there is no Add<i32> implementation for Point',
          'It panics at runtime',
          'It returns an integer by default'
        ],
        answer: 1,
        explanation: 'Operator overloading is strictly type-driven. `Point + 5` would require an `impl Add<i32> for Point`. Without it, the compiler rejects the expression.'
      }
    ]
  }
});
