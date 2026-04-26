Object.assign(QUIZZES, {
  'ch48': {
    title: 'Chapter 48 Quiz: Closures',
    questions: [
      {
        q: 'What makes a closure different from a regular function?',
        options: [
          'Closures are slower than regular functions',
          'Closures can capture variables from the scope in which they are defined',
          'Closures cannot take parameters',
          'Closures must always be stored in a variable'
        ],
        answer: 1,
        explanation: 'The defining feature of a closure is environment capture: it can access variables from the surrounding scope, which regular functions defined with fn cannot.'
      },
      {
        q: 'Which closure trait is implemented by ALL closures, regardless of how they capture their environment?',
        options: ['Fn', 'FnMut', 'FnOnce', 'FnBox'],
        answer: 2,
        explanation: 'FnOnce is the most permissive trait and is implemented by all closures, since any closure can be called at least once. Fn and FnMut impose additional restrictions.'
      },
      {
        q: 'What does the move keyword do in a closure?',
        options: [
          'It moves the closure itself into a new memory location',
          'It forces the closure to take ownership of the variables it captures',
          'It allows the closure to mutate captured variables',
          'It makes the closure run on a separate thread automatically'
        ],
        answer: 1,
        explanation: 'move forces the closure to own its captured values rather than borrowing them. This is required when the closure must outlive the scope where the variables were defined.'
      },
      {
        q: 'You have a closure: let mut count = 0; let mut inc = || { count += 1; }; Why must inc be declared mut?',
        options: [
          'Because count is declared mut',
          'Because closures that mutate captured variables must themselves be declared mut to call',
          'Because all closures must be mut by default',
          'Because the borrow checker requires it for all closures'
        ],
        answer: 1,
        explanation: 'A closure that mutates a captured variable implements FnMut. Calling an FnMut closure requires a mutable borrow of the closure itself, so the closure variable must be declared mut.'
      },
      {
        q: 'Which trait bound should you use for a function parameter that accepts a closure called only once and that may move owned values out of its capture?',
        options: ['Fn', 'FnMut', 'FnOnce', 'Copy'],
        answer: 2,
        explanation: 'FnOnce allows a closure to move captured values out, since the closure can only be called once (after which the moved values are gone). Fn and FnMut require the closure to be callable multiple times.'
      }
    ]
  },

  'ch49': {
    title: 'Chapter 49 Quiz: Iterators',
    questions: [
      {
        q: 'What does the next() method of an Iterator return when there are no more elements?',
        options: ['0', 'false', 'None', 'An empty Vec'],
        answer: 2,
        explanation: 'next() returns Option<Self::Item>: Some(value) while elements remain and None when the iterator is exhausted.'
      },
      {
        q: 'What is the difference between iter() and into_iter() on a Vec?',
        options: [
          'iter() yields owned values, into_iter() yields references',
          'iter() borrows the Vec and yields &T, into_iter() consumes the Vec and yields T',
          'iter() is slower, into_iter() is faster',
          'There is no difference; they do the same thing'
        ],
        answer: 1,
        explanation: 'iter() borrows the collection and yields shared references (&T), leaving the original available. into_iter() consumes the collection (moves it) and yields owned values (T).'
      },
      {
        q: 'Why must an iterator variable be declared mut when calling next() manually?',
        options: [
          'Because next() returns a mutable reference',
          'Because next() takes &mut self, advancing an internal cursor',
          'Because iterators are always mutable by default',
          'Because the compiler requires mut for all iterator types'
        ],
        answer: 1,
        explanation: 'next() is defined as fn next(&mut self), meaning it needs a mutable borrow of the iterator to advance its internal state. Hence the iterator variable must be mut.'
      },
      {
        q: 'What happens if you call map() on an iterator and never consume the result?',
        options: [
          'The map transformation runs immediately and the result is discarded',
          'A compile error occurs',
          'A runtime panic occurs',
          'Nothing happens; the compiler warns about an unused iterator'
        ],
        answer: 3,
        explanation: 'Iterators are lazy. map() returns a new iterator struct without doing any work. If never consumed, the compiler may emit a warning about unused must_use values, but no work is done.'
      },
      {
        q: 'Which method gives you the Unicode character count of a &str correctly, even for multi-byte characters?',
        options: [
          's.len()',
          's.bytes().count()',
          's.chars().count()',
          's.split("").count()'
        ],
        answer: 2,
        explanation: 'chars() iterates over Unicode scalar values. len() and bytes().count() return the number of bytes, which can differ from the character count for non-ASCII text.'
      }
    ]
  },

  'ch50': {
    title: 'Chapter 50 Quiz: map, filter, fold',
    questions: [
      {
        q: 'What does map() do to the elements of an iterator?',
        options: [
          'It removes elements that do not match a condition',
          'It applies a closure to each element and yields the transformed results',
          'It combines all elements into a single value',
          'It reverses the order of elements'
        ],
        answer: 1,
        explanation: 'map() takes a closure and produces a new iterator where each element is the result of applying the closure to the original element.'
      },
      {
        q: 'What is the correct starting accumulator value for folding a list to compute a product?',
        options: ['0', '1', 'The first element of the list', 'The length of the list'],
        answer: 1,
        explanation: 'The identity element for multiplication is 1 (multiplying by 1 leaves the value unchanged). Starting fold at 0 would make the product always 0.'
      },
      {
        q: 'What does filter_map() do that filter() alone cannot?',
        options: [
          'It filters elements and also changes their type in one step, discarding None results',
          'It filters based on two conditions simultaneously',
          'It is faster than filter() for large collections',
          'It filters in reverse order'
        ],
        answer: 0,
        explanation: 'filter_map() applies a closure that returns Option<T>. Elements where the closure returns None are dropped; elements returning Some(value) are kept, and the type can change.'
      },
      {
        q: 'Which iterator method is best for printing every element as a side effect, without building a new collection?',
        options: ['map()', 'filter()', 'for_each()', 'fold()'],
        answer: 2,
        explanation: 'for_each() is a consuming adapter that calls the closure for each element purely for its side effects. map() is lazy and wrong for side effects; fold() is for reduction.'
      },
      {
        q: 'What does zip() do?',
        options: [
          'It compresses the iterator to save memory',
          'It pairs elements from two iterators into tuples, stopping when the shorter one ends',
          'It merges two iterators by interleaving their elements',
          'It sorts two iterators and merges them'
        ],
        answer: 1,
        explanation: 'zip() takes two iterators and produces an iterator of (a, b) tuples. It stops as soon as either iterator is exhausted, so the result length equals the length of the shorter input.'
      }
    ]
  },

  'ch51': {
    title: 'Chapter 51 Quiz: Lazy Evaluation',
    questions: [
      {
        q: 'When does a Rust iterator adapter like map() or filter() actually do its work?',
        options: [
          'Immediately when the adapter method is called',
          'On the next line after the adapter call',
          'Only when a consuming method like collect() or sum() calls next() repeatedly',
          'Only when the program exits'
        ],
        answer: 2,
        explanation: 'Rust iterators are lazy. Adapter methods return new iterator structs that encode the pending operation. Work only happens element-by-element when a consuming method calls next().'
      },
      {
        q: 'Which of these expressions creates an iterator over an infinite sequence?',
        options: [
          'vec![1, 2, 3].iter()',
          '(0..100).iter()',
          '(0..).map(|x| x * x)',
          'std::usize::MAX'
        ],
        answer: 2,
        explanation: '(0..) is an unbounded range that yields 0, 1, 2, ... forever. Chaining .map() on it creates an infinite iterator of squares. It is safe because Rust never evaluates the whole sequence upfront.'
      },
      {
        q: 'Why can Rust have infinite iterators without running out of memory?',
        options: [
          'Because Rust uses streaming compression to store infinite values',
          'Because values are computed one at a time on demand, not all at once',
          'Because the OS provides unlimited virtual memory for iterators',
          'Because iterators automatically stop when memory is full'
        ],
        answer: 1,
        explanation: 'Lazy evaluation means only one element is computed at a time when next() is called. No storage for future elements is needed, so an "infinite" iterator uses constant memory.'
      },
      {
        q: 'Which method stops iterating as soon as it finds the first element matching a condition?',
        options: ['filter()', 'map()', 'find()', 'collect()'],
        answer: 2,
        explanation: 'find() is a short-circuit consuming method. It calls next() until it finds an element for which the closure returns true, then stops. It returns Option<T>.'
      },
      {
        q: 'What is a key performance advantage of chaining map().filter().sum() over creating intermediate Vec collections for each step?',
        options: [
          'The chain is parallelized across CPU cores automatically',
          'Each element passes through the entire chain in a single pass with no intermediate allocations',
          'The chain uses SIMD instructions for vectorized execution',
          'The chain compiles to fewer CPU instructions than a for loop'
        ],
        answer: 1,
        explanation: 'A lazy iterator chain processes each element all the way through in one pass. Intermediate Vec collections require extra heap allocations and additional passes over the data.'
      }
    ]
  },

  'ch52': {
    title: 'Chapter 52 Quiz: Higher-Order Functions',
    questions: [
      {
        q: 'What is a higher-order function?',
        options: [
          'A function defined at the top of a file',
          'A function that takes another function or closure as a parameter, or returns one',
          'A function that is called more than once',
          'A function that uses generics'
        ],
        answer: 1,
        explanation: 'A higher-order function is one that treats functions as first-class values: it accepts them as arguments or returns them as results. map() and filter() are classic examples.'
      },
      {
        q: 'What is the main limitation of function pointers (fn type) compared to closures?',
        options: [
          'Function pointers are slower than closures',
          'Function pointers cannot be stored in variables',
          'Function pointers cannot capture variables from their surrounding environment',
          'Function pointers cannot be passed to other functions'
        ],
        answer: 2,
        explanation: 'A fn pointer points to a named function and has no associated captured state. It cannot close over local variables. Use impl Fn or dyn Fn when you need to capture environment.'
      },
      {
        q: 'Why must you use move when returning a closure from a function that captures a local variable?',
        options: [
          'Because the compiler requires move for all returned closures',
          'Because without move, the closure borrows the local variable which is dropped when the function returns',
          'Because move makes the closure implement FnOnce instead of Fn',
          'Because move prevents the closure from being called more than once'
        ],
        answer: 1,
        explanation: 'When a function returns, its local variables are dropped. A closure returning a borrow to a dropped local would be a dangling reference. move transfers ownership into the closure so it can safely outlive the function.'
      },
      {
        q: 'What return type should you use when a function may return different closure types based on a condition?',
        options: [
          'impl Fn()',
          'fn()',
          'Box<dyn Fn()>',
          'Closure<>'
        ],
        answer: 2,
        explanation: 'impl Fn() requires a single concrete type at compile time. When different branches return different closure types, Box<dyn Fn()> (a trait object) is needed so all branches return the same sized type.'
      },
      {
        q: 'Which of these correctly passes a named function where an impl Fn(i32) -> i32 is expected?',
        options: [
          'fn double(x: i32) -> i32 { x * 2 } apply(5, &double)',
          'fn double(x: i32) -> i32 { x * 2 } apply(5, double)',
          'fn double(x: i32) -> i32 { x * 2 } apply(5, double())',
          'fn double(x: i32) -> i32 { x * 2 } apply(5, *double)'
        ],
        answer: 1,
        explanation: 'Named functions can be passed by name without parentheses. apply(5, double) passes the function itself as a value. double() would call it immediately and pass the result instead.'
      }
    ]
  },

  'ch53': {
    title: 'Chapter 53 Quiz: Writing Iterator Adapters',
    questions: [
      {
        q: 'What is the minimum you must provide when implementing the Iterator trait for a custom type?',
        options: [
          'Only the next() method',
          'type Item and fn next(&mut self) -> Option<Self::Item>',
          'type Item, fn next(), fn size_hint(), and fn collect()',
          'fn next() and fn into_iter()'
        ],
        answer: 1,
        explanation: 'The Iterator trait requires exactly two things: the associated type Item and the next() method. All other methods (map, filter, collect, etc.) have default implementations in the trait.'
      },
      {
        q: 'After implementing Iterator for a struct with just next(), which other methods are automatically available?',
        options: [
          'None; you must implement each method manually',
          'Only collect()',
          'All default-implemented methods like map(), filter(), sum(), enumerate(), etc.',
          'Only the methods you explicitly list in the impl block'
        ],
        answer: 2,
        explanation: 'The Iterator trait provides default implementations for dozens of methods, all built on next(). Implement next() once and get the entire iterator toolbox for free.'
      },
      {
        q: 'What must next() always return after it has returned None once?',
        options: [
          'It may return Some values again if the iterator resets',
          'It must return None consistently; iterators are not required to be restartable',
          'It must panic to signal the iteration is over',
          'It must return Some(Default::default())'
        ],
        answer: 1,
        explanation: 'By convention, once an iterator returns None, all subsequent calls to next() should also return None. Many consumers rely on this behavior. Fused iterators guarantee it explicitly.'
      },
      {
        q: 'What is the purpose of the size_hint() method on an iterator?',
        options: [
          'To limit how many elements the iterator can yield',
          'To tell consumers an estimate of remaining elements, enabling pre-allocation',
          'To check if the iterator is empty',
          'To set the capacity of a Vec before collect() is called'
        ],
        answer: 1,
        explanation: 'size_hint() returns (lower_bound, Option<upper_bound>). Methods like collect() use this to call Vec::with_capacity(), avoiding repeated reallocations as elements are collected.'
      },
      {
        q: 'What does the ? operator do inside an Iterator::next() implementation?',
        options: [
          'It propagates errors from the inner iterator',
          'It unwraps Some or returns None early if the inner iterator is exhausted',
          'It skips None values and continues to the next element',
          'It converts the Option return to a Result'
        ],
        answer: 1,
        explanation: 'Inside a function returning Option<T>, the ? operator on an Option unwraps Some(x) to x, or returns None immediately if the value is None. This is idiomatic for delegating to an inner iterator.'
      }
    ]
  }
});
