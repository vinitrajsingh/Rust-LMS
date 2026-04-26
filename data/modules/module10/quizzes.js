/* ================================================================
   Module 10: Smart Pointers & Advanced Types
   Quizzes: ch62 - ch69
   ================================================================ */
Object.assign(QUIZZES, {

  'ch62': {
    title: 'Chapter 62 Quiz: Box&lt;T&gt;',
    questions: [
      {
        q: 'What does Box::new(5) do with the integer value 5?',
        options: [
          'Stores it on the stack only, like a normal variable',
          'Stores it on the heap and keeps a pointer to it on the stack',
          'Creates a copy of 5 on both the stack and the heap',
          'Stores it in static memory for the lifetime of the program'
        ],
        answer: 1,
        explanation: 'Box::new() moves the value to the heap and returns a pointer (the "box") that lives on the stack. The pointer is small and fixed-size regardless of what the box points to.'
      },
      {
        q: 'You write `enum List { Cons(i32, List), Nil }` and the compiler rejects it. What is the error?',
        options: [
          'recursive type `List` has infinite size',
          'cannot borrow `List` as mutable',
          'expected struct, found enum',
          'type annotations needed for `List`'
        ],
        answer: 0,
        explanation: 'A recursive type that contains itself directly has infinite size because the compiler cannot compute how many bytes to allocate. Wrapping the recursive part in Box<List> fixes this because Box always has a known pointer size.'
      },
      {
        q: 'Which situation is Box<T> MOST appropriate for?',
        options: [
          'Storing a single i32 value more safely than a plain variable',
          'Sharing the same data between multiple owners',
          'Breaking a recursive type definition so the compiler can compute its size',
          'Allowing interior mutability without a lock'
        ],
        answer: 2,
        explanation: 'Box<T> is specifically designed to give recursive types a known size by introducing heap indirection. Sharing data uses Rc<T> or Arc<T>, and interior mutability uses RefCell<T> or Mutex<T>.'
      },
      {
        q: 'Given `let b = Box::new(5i32);`, what does `*b` evaluate to?',
        options: [
          'A Box pointing to 5',
          'The memory address of 5 on the heap',
          'The value 5, as an i32',
          'An error: Box cannot be dereferenced without unsafe'
        ],
        answer: 2,
        explanation: 'Box<T> implements the Deref trait, so `*b` calls `b.deref()` and then dereferences the result, yielding the inner i32 value 5. No unsafe code is needed.'
      },
      {
        q: 'What happens to the heap memory when a Box<T> variable goes out of scope?',
        options: [
          'It remains on the heap until the program ends',
          'It is moved to the stack',
          'It becomes a dangling pointer',
          'It is automatically freed by Box\'s Drop implementation'
        ],
        answer: 3,
        explanation: 'Box<T> implements Drop. When the box goes out of scope, Rust calls drop() automatically, which frees both the stack pointer and the heap allocation. There is no garbage collector or manual free needed.'
      }
    ]
  },

  'ch63': {
    title: 'Chapter 63 Quiz: Rc&lt;T&gt;',
    questions: [
      {
        q: 'What does Rc::clone(&a) do?',
        options: [
          'Deep-copies the data inside the Rc and puts it in a new heap allocation',
          'Increments the reference count and returns a new Rc handle pointing to the same data',
          'Moves the data out of the Rc, leaving the Rc empty',
          'Creates a Weak reference to the data'
        ],
        answer: 1,
        explanation: 'Rc::clone() is a shallow clone: it only increments the reference count and returns a new handle. The underlying data is not copied. This is why the convention is Rc::clone(&a) rather than a.clone() — to make the cheap operation visible.'
      },
      {
        q: 'When is the data inside an Rc<T> actually freed?',
        options: [
          'When the first clone goes out of scope',
          'When Rc::drop() is called explicitly by the programmer',
          'When the strong reference count reaches zero',
          'When the weak reference count reaches zero'
        ],
        answer: 2,
        explanation: 'Rc<T> tracks how many strong references exist. The data is freed only when the strong count reaches zero, meaning no owner is left. Weak references (weak count) do not affect this decision.'
      },
      {
        q: 'Given: `let a = Rc::new(5); let b = Rc::clone(&a); let c = Rc::clone(&a);` What does Rc::strong_count(&a) return?',
        options: [
          '1 (only the original variable counts)',
          '2 (only b and c count, not the original)',
          '3 (a, b, and c all hold a strong reference)',
          '0 (Rc::strong_count only counts dropped references)'
        ],
        answer: 2,
        explanation: 'The strong count starts at 1 when a is created. Each Rc::clone() call increments it by 1. After two clones, the count is 3: one for a, one for b, one for c.'
      },
      {
        q: 'Why does Rc<T> not implement the Send trait, making it unusable across threads?',
        options: [
          'Rc values are too large to transfer between threads efficiently',
          'The reference count is a plain integer with no atomic guarantees, so concurrent updates would be a data race',
          'Rust forbids heap-allocated types from crossing thread boundaries',
          'Rc requires the Drop trait, and Drop is not thread-safe'
        ],
        answer: 1,
        explanation: 'Rc<T> uses a plain (non-atomic) integer for its reference count. If two threads incremented or decremented the count simultaneously, the count would be corrupted. Arc<T> solves this with atomic operations.'
      },
      {
        q: 'You have `let a = Rc::new(10); let b = Rc::clone(&a); drop(b);`. What is Rc::strong_count(&a) after the drop?',
        options: [
          '0 — all clones were dropped so the count is 0',
          '1 — a is still alive, and b was the only clone that dropped',
          '2 — strong_count does not decrement on drop',
          'The program panics because you cannot drop an Rc clone'
        ],
        answer: 1,
        explanation: 'Dropping b decrements the strong count by 1 (from 2 to 1). The count only reaches 0 when all Rc handles, including the original a, are dropped. Since a is still alive, the count is 1.'
      }
    ]
  },

  'ch64': {
    title: 'Chapter 64 Quiz: Arc&lt;T&gt;',
    questions: [
      {
        q: 'What does "Arc" stand for?',
        options: [
          'Automatically Reference Counted',
          'Atomically Reference Counted',
          'Async Reference Controller',
          'Advanced Reference Cell'
        ],
        answer: 1,
        explanation: 'Arc stands for Atomically Reference Counted. The key difference from Rc (Reference Counted) is that Arc uses atomic CPU instructions to update its reference count, making the count updates thread-safe.'
      },
      {
        q: 'What is the key difference between Rc<T> and Arc<T>?',
        options: [
          'Arc<T> stores data on the stack while Rc<T> uses the heap',
          'Rc<T> can hold any type, but Arc<T> is restricted to primitives',
          'Arc<T> uses atomic operations for its reference count, making it safe to use across threads',
          'Arc<T> automatically prevents data races by locking the data on creation'
        ],
        answer: 2,
        explanation: 'Both Rc<T> and Arc<T> store data on the heap and support any type. The only meaningful difference is that Arc<T> uses atomic (indivisible) CPU instructions to update its reference count, so the count stays correct even when multiple threads increment or decrement it simultaneously.'
      },
      {
        q: 'Can Arc<T> alone be used to mutate shared data across multiple threads?',
        options: [
          'Yes — Arc<T> provides a write lock automatically when you call deref_mut()',
          'No — Arc<T> only gives shared (&T) access; you need Mutex<T> or similar to enable mutation',
          'Yes, but only if T implements the Copy trait',
          'No — Arc<T> cannot be used for mutation at all, even in a single thread'
        ],
        answer: 1,
        explanation: 'Arc<T> makes the reference count thread-safe, but the data behind Arc is accessed only through shared (&T) references. To mutate shared data across threads, you wrap the data in Mutex<T> (or RwLock<T>) and then share the Arc<Mutex<T>>.'
      },
      {
        q: 'How do you correctly pass an Arc<T> value into a new thread?',
        options: [
          'Pass the Arc<T> directly without cloning; Arc automatically handles the transfer',
          'Use Arc::borrow() to get a reference, then pass the reference',
          'Clone the Arc<T> with Arc::clone() and move the clone into the thread',
          'Use Arc::send() which is specifically designed for thread transfer'
        ],
        answer: 2,
        explanation: 'You call Arc::clone() to get a new handle that shares the same heap allocation, then use a `move` closure to move the clone into the thread. This correctly increments the reference count, ensuring the data stays alive while the thread uses it.'
      },
      {
        q: '(Recall ch63) What compile error would you see if you tried to send Rc<i32> to a new thread?',
        options: [
          'recursive type has infinite size',
          'cannot borrow as mutable more than once at a time',
          '`Rc<i32>` cannot be sent between threads safely — the trait `Send` is not implemented',
          'use of moved value: the Rc was already moved'
        ],
        answer: 2,
        explanation: 'Rc<T> does not implement Send because its reference count is not atomic. The compiler enforces this by checking that anything moved into a thread is Send. The error message points you directly to the trait bound that is missing.'
      }
    ]
  },

  'ch65': {
    title: 'Chapter 65 Quiz: Weak&lt;T&gt;',
    questions: [
      {
        q: 'Which function creates a Weak<T> from an existing Rc<T>?',
        options: [
          'Rc::weaken(&rc)',
          'Rc::downgrade(&rc)',
          'Rc::borrow_weak(&rc)',
          'Weak::from_rc(&rc)'
        ],
        answer: 1,
        explanation: 'Rc::downgrade(&rc) creates a Weak<T> reference. The naming "downgrade" signals that you are giving up ownership claims (going from a strong reference to a weak one). The opposite, Weak::upgrade(), attempts to recover a strong Rc.'
      },
      {
        q: 'What does Weak::upgrade() return?',
        options: [
          'A direct reference &T to the inner value',
          'The current strong reference count',
          'Option<Rc<T>>: Some if the data is still alive, None if it has been dropped',
          'Result<Rc<T>, WeakError>: Ok if alive, Err if dropped'
        ],
        answer: 2,
        explanation: 'upgrade() returns Option<Rc<T>> because the data might have been freed (if all strong references were dropped). Returning an Option forces you to explicitly handle the case where the data is gone, preventing use-after-free bugs.'
      },
      {
        q: 'Do Weak<T> references prevent the data they point to from being dropped?',
        options: [
          'Yes — any reference, strong or weak, keeps the data alive',
          'Yes, but only for 30 seconds before the weak reference expires',
          'No — only strong references (Rc) keep the data alive; Weak references do not affect the strong count',
          'It depends on whether the type T implements Drop'
        ],
        answer: 2,
        explanation: 'Weak<T> references only increment the weak count, not the strong count. The data is freed when the strong count reaches zero, regardless of how many weak references still exist. After the data is dropped, upgrade() returns None.'
      },
      {
        q: 'What is a reference cycle in the context of Rc<T>?',
        options: [
          'When Rc::clone() is called more than 65535 times on the same value',
          'When two or more Rc values hold strong references to each other in a loop, preventing the count from ever reaching zero',
          'When an Rc value wraps a recursive type like a linked list',
          'When the same Rc is moved in and out of a function repeatedly'
        ],
        answer: 1,
        explanation: 'A reference cycle forms when Rc values form a chain where each points to the next and the last points back to the first. Since each Rc holds a strong reference to another, no count ever reaches zero. The data is never freed, causing a memory leak.'
      },
      {
        q: '(Recall ch63) You have strong_count = 1 and weak_count = 3. When the last strong reference is dropped, what happens?',
        options: [
          'Nothing: weak_count is 3, so the data is kept alive',
          'The data is freed immediately; all three Weak references return None on upgrade()',
          'One Weak reference is automatically promoted to a strong Rc to prevent the data from being freed',
          'The program panics because Weak references are still alive'
        ],
        answer: 1,
        explanation: 'The data is freed when the strong count reaches zero, regardless of the weak count. After the data is freed, any remaining Weak references are not freed (the allocation persists until weak_count also reaches zero) but upgrade() returns None because the value is gone.'
      }
    ]
  },

  'ch66': {
    title: 'Chapter 66 Quiz: Deref &amp; Drop',
    questions: [
      {
        q: 'What must the deref() method in the Deref trait return?',
        options: [
          'An owned value of type T',
          'A reference &Self::Target (a reference to the target type)',
          'A Box<T> containing the value',
          'Option<&Self::Target>'
        ],
        answer: 1,
        explanation: 'deref() must return &Self::Target, a reference to the target. It cannot return an owned value because that would require moving the data out of self, which is impossible through a shared &self reference. Rust then automatically dereferences that reference to complete the * operation.'
      },
      {
        q: 'What is deref coercion?',
        options: [
          'An unsafe cast that converts a raw pointer to a safe reference',
          'An automatic compile-time conversion where Rust calls deref() repeatedly to match a function\'s expected reference type',
          'A runtime check that verifies a smart pointer is valid before dereferencing',
          'A way to convert a mutable reference into an immutable one'
        ],
        answer: 1,
        explanation: 'Deref coercion is Rust calling deref() automatically, as many times as needed, to convert from one reference type to another. For example, &MyBox<String> becomes &String becomes &str, all at compile time with zero runtime cost.'
      },
      {
        q: 'In what order are local variables dropped when a function ends?',
        options: [
          'In the order they were declared (first declared, first dropped)',
          'All at the same time simultaneously',
          'In reverse order of declaration (last declared, first dropped)',
          'In alphabetical order by variable name'
        ],
        answer: 2,
        explanation: 'Rust drops local variables in reverse order of their declaration. If you declare a, then b, then c, they are dropped c, then b, then a. This mirrors the LIFO (last-in, first-out) behavior of the stack.'
      },
      {
        q: 'Why does Rust forbid calling value.drop() directly?',
        options: [
          'drop() requires an unsafe block because it is inherently dangerous',
          'Rust uses the keyword delete for explicit cleanup, not drop()',
          'Calling drop() directly would result in a double-free: Rust also calls drop at end of scope, freeing the same memory twice',
          'drop() is only available on heap-allocated types, not stack values'
        ],
        answer: 2,
        explanation: 'Rust automatically calls drop at end of scope for every value. If you could also call it manually, the destructor would run twice for the same memory, which is undefined behavior (double-free). The free function std::mem::drop() avoids this by taking ownership, preventing the end-of-scope call.'
      },
      {
        q: 'How do you force a value to be dropped before the end of its enclosing scope?',
        options: [
          'Assign () to the variable: value = ();',
          'Call std::mem::drop(value), which takes ownership and runs the destructor immediately',
          'Use the drop! macro from the standard library',
          'Call value.free(), which is the correct public API for early cleanup'
        ],
        answer: 1,
        explanation: 'std::mem::drop(value) takes ownership of the value and immediately runs its Drop implementation. Because it takes ownership, Rust does not call drop again at end of scope. This function is in the prelude, so you can call it as just drop(value).'
      }
    ]
  },

  'ch67': {
    title: 'Chapter 67 Quiz: Send &amp; Sync',
    questions: [
      {
        q: 'A type T implements Send if:',
        options: [
          'T implements the Clone trait and can be duplicated',
          'T can be safely transferred (its ownership moved) to another thread',
          'T is stored on the heap rather than the stack',
          'T implements the Display trait and can be printed from any thread'
        ],
        answer: 1,
        explanation: 'Send means it is safe to move a value of type T to a different thread. The value is no longer accessible from the original thread after the transfer. Most Rust types are Send; notable exceptions include Rc<T> and raw pointers.'
      },
      {
        q: 'A type T is Sync if:',
        options: [
          'T can be cloned and one clone sent to each thread',
          'T implements the Send trait',
          '&T can be safely sent to another thread, meaning multiple threads can hold shared references simultaneously',
          'T is wrapped in a Mutex and therefore protected from concurrent access'
        ],
        answer: 2,
        explanation: 'Sync means that a shared reference &T can safely be sent to another thread. In other words, it is safe for multiple threads to hold &T at the same time. Equivalently, T is Sync if and only if &T is Send.'
      },
      {
        q: 'Which of the following types does NOT implement Send?',
        options: [
          'String',
          'Vec<i32>',
          'Arc<i32>',
          'Rc<i32>'
        ],
        answer: 3,
        explanation: 'Rc<i32> is not Send because its reference count is a plain integer. Concurrently modifying it from two threads would be a data race. String, Vec<i32>, and Arc<i32> are all Send because their internals are either plain data or use atomic operations.'
      },
      {
        q: 'Which of the following types does NOT implement Sync?',
        options: [
          'Arc<i32>',
          'i32',
          'RefCell<i32>',
          'Mutex<i32>'
        ],
        answer: 2,
        explanation: 'RefCell<i32> is not Sync because it allows interior mutation through borrow_mut() with no locking. If two threads both called borrow_mut() simultaneously, the internal borrow state would be corrupted. Mutex<i32> is Sync because it uses a lock to serialize access.'
      },
      {
        q: 'Why is MutexGuard<T> not Send, even though Mutex<T> itself is?',
        options: [
          'MutexGuard does not implement Clone, which is required for Send',
          'MutexGuard\'s Drop implementation (which unlocks the mutex) must run on the same OS thread that locked it, so it cannot be moved to another thread',
          'MutexGuard contains a raw pointer, and raw pointers are never Send',
          'Mutex<T> is not actually Send; this premise is incorrect'
        ],
        answer: 1,
        explanation: 'On many platforms, a mutex must be unlocked by the same thread that locked it. Since MutexGuard\'s destructor unlocks the mutex, sending a MutexGuard to another thread and dropping it there would violate this requirement and cause undefined behavior.'
      }
    ]
  },

  'ch68': {
    title: 'Chapter 68 Quiz: Newtype Pattern',
    questions: [
      {
        q: 'What problem does the Newtype pattern solve?',
        options: [
          'It enables shared ownership of a heap-allocated value',
          'It allows you to implement external traits on external types by wrapping them in a local struct',
          'It avoids heap allocation by keeping data on the stack',
          'It provides thread-safe interior mutability'
        ],
        answer: 1,
        explanation: 'The orphan rule prevents implementing external traits on external types directly. The Newtype pattern creates a local tuple struct that wraps the external type. Since the wrapper is local to your crate, you can implement any trait on it.'
      },
      {
        q: 'Given `struct Meters(f64)`, how do you access the inner f64 value from a Meters variable m?',
        options: [
          'm.value',
          'm.inner()',
          'm.get()',
          'm.0'
        ],
        answer: 3,
        explanation: 'A newtype is a tuple struct with one field. Tuple struct fields are accessed by their numeric index. The first (and only) field is accessed with .0. There is no named field unless you add one explicitly.'
      },
      {
        q: 'What is the runtime performance cost of a newtype wrapper?',
        options: [
          'One extra heap allocation per wrapped value',
          'One pointer dereference per field access',
          'Zero: the compiler completely erases the wrapper type during compilation',
          'A small overhead proportional to the size of the wrapped type'
        ],
        answer: 2,
        explanation: 'Newtypes are zero-cost abstractions. The Rust compiler optimizes away the tuple struct wrapper entirely: a Meters(f64) in memory is identical to a plain f64. The type distinction exists only during compilation; at runtime there is no overhead.'
      },
      {
        q: 'You have `struct UserId(u32)` and `struct OrderId(u32)`, and a function `fn process(id: UserId)`. What happens if you call `process(OrderId(5))`?',
        options: [
          'It compiles, because UserId and OrderId both contain u32',
          'It runs but prints a runtime type mismatch warning',
          'The compiler rejects it with a type mismatch error',
          'It compiles only if you add #[derive(From)] to the structs'
        ],
        answer: 2,
        explanation: 'UserId and OrderId are distinct types in Rust\'s type system, even though they both wrap a u32. The compiler treats them as completely different types and rejects passing one where the other is expected. This is the entire point of the Newtype pattern for type safety.'
      },
      {
        q: 'Which trait should you implement on a newtype to make all of the inner type\'s methods automatically available?',
        options: [
          'Clone',
          'Copy',
          'From',
          'Deref'
        ],
        answer: 3,
        explanation: 'Implementing Deref with Target = InnerType causes Rust\'s deref coercion to automatically forward method calls to the inner type. For example, if Wrapper wraps Vec<String> and implements Deref<Target = Vec<String>>, then wrapper.len() works without any manual forwarding.'
      }
    ]
  },

  'ch69': {
    title: 'Chapter 69 Quiz: Phantom Types',
    questions: [
      {
        q: 'What is PhantomData<T>?',
        options: [
          'A runtime value that stores a dynamically typed T at runtime',
          'A zero-sized marker type that tells the compiler a struct logically involves type T, without storing any T data',
          'A trait that types must implement to be usable as type parameters',
          'A special Box type for types with unknown sizes'
        ],
        answer: 1,
        explanation: 'PhantomData<T> is a zero-sized type from std::marker. It takes up zero bytes at runtime. Its purpose is purely compile-time: it informs the Rust compiler about ownership, variance, and lifetime relationships that would otherwise be invisible because no actual T value is stored.'
      },
      {
        q: 'What is the size in memory of PhantomData<String>?',
        options: [
          '24 bytes (the size of String on 64-bit systems)',
          '8 bytes (pointer size)',
          '4 bytes',
          '0 bytes'
        ],
        answer: 3,
        explanation: 'PhantomData<T> has zero size regardless of what T is. It is a zero-sized type (ZST) that exists only at the type level. Adding PhantomData<String> to a struct does not increase the struct\'s memory footprint at all.'
      },
      {
        q: 'Why is the PhantomData field in a struct conventionally named with an underscore prefix (e.g., _marker)?',
        options: [
          'The underscore makes the field private and inaccessible from outside the module',
          'The PhantomData type requires fields to start with an underscore',
          'The underscore prefix tells the compiler the field is intentionally unused in code, suppressing the unused-field warning',
          'The underscore prefix enables special zero-cost optimizations for that field'
        ],
        answer: 2,
        explanation: 'In Rust, a variable or field name starting with an underscore tells the compiler not to warn about it being unused. Since PhantomData fields are never actually read (they have no data), the underscore prevents a spurious "field is never read" warning.'
      },
      {
        q: 'In a phantom type builder pattern where Config<Unbuilt> has build() -> Config<Built> and Config<Built> has connect(), what prevents calling connect() on a Config<Unbuilt>?',
        options: [
          'A runtime check inside connect() that panics if the config is not built',
          'The type system: connect() is only defined for Config<Built>, so calling it on Config<Unbuilt> is a compile error',
          'A feature flag that disables connect() until build() has been called',
          'An assert!() macro inside the builder that validates state before allowing method calls'
        ],
        answer: 1,
        explanation: 'This is the key insight of the phantom type builder pattern. connect() is implemented only in `impl Config<Built>`. Calling it on a Config<Unbuilt> value is a type error at compile time because Config<Unbuilt> and Config<Built> are different types. No runtime check is needed.'
      },
      {
        q: '(Recall ch68) Both the Newtype pattern and PhantomData are described as zero-cost abstractions. What does that mean they have in common?',
        options: [
          'Both require unsafe code to implement correctly',
          'Both use PhantomData internally to track the wrapped type',
          'Both are only available on nightly Rust, not stable',
          'Both encode information purely in the type system at compile time, adding no runtime overhead'
        ],
        answer: 3,
        explanation: 'A zero-cost abstraction means the feature provides compile-time guarantees or conveniences with no runtime cost. Newtypes are erased by the compiler and become identical to the wrapped type at runtime. PhantomData has zero bytes. Both give you powerful compile-time type-system tools for free.'
      }
    ]
  }

});
