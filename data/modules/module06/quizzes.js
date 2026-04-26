/* ================================================================
   Module 6: Collections & Error Handling
   Quizzes: ch33–ch40 (all complete)
   ================================================================ */
Object.assign(QUIZZES, {

  'ch33': {
    title: 'Chapter 33 Quiz: Vec<T>',
    questions: [
      {
        q: 'What is the difference between using &v[i] and v.get(i) to access a vector element?',
        options: [
          '&v[i] returns a reference while v.get(i) returns an owned value',
          '&v[i] panics if the index is out of bounds; v.get(i) returns None instead',
          '&v[i] is faster; v.get(i) performs bounds checking every time',
          'v.get(i) only works on mutable vectors'
        ],
        answer: 1,
        explanation: '&v[i] panics immediately if the index is out of bounds. v.get(i) returns Option<&T>, returning None when the index is invalid. Use v.get() when the index might be out of range.'
      },
      {
        q: 'Why does Rust reject the following code: let mut v = vec![1,2,3]; let first = &v[0]; v.push(4); println!("{}", first);',
        options: [
          'Because first is immutable and cannot be printed after a mutation',
          'Because push() requires the vector to be declared with a type annotation',
          'Because push() might reallocate the vector, which would invalidate the reference first holds',
          'Because you cannot have both let first and v.push() in the same scope'
        ],
        answer: 2,
        explanation: 'When a vector grows, it may need to allocate new memory and copy all elements. If this happens, the reference stored in first would point to freed memory. The borrow checker prevents this by rejecting the mutable borrow (push) while an immutable borrow (first) is still live.'
      },
      {
        q: 'How do you modify each element of a Vec<i32> in place by doubling it?',
        options: [
          'for n in v { n *= 2; }',
          'for n in &v { n *= 2; }',
          'for n in &mut v { *n *= 2; }',
          'for n in v.iter() { n *= 2; }'
        ],
        answer: 2,
        explanation: 'You must iterate with &mut v to get mutable references, and then dereference with * to modify the value through the reference. Iterating with &v gives immutable references, and iterating without & moves the vector into the loop.'
      },
      {
        q: 'A Vec<SpreadsheetCell> stores enum variants with Int(i32), Float(f64), and Text(String). What is the main advantage of this pattern?',
        options: [
          'It avoids the overhead of heap allocation for each cell value',
          'It allows a single vector to store values of multiple underlying types while keeping the type system happy',
          'It makes the vector sortable without implementing Ord',
          'It allows the vector to grow without reallocation'
        ],
        answer: 1,
        explanation: "A Vec can only store one type. Wrapping different types in an enum's variants makes them all the same type (the enum), allowing a single Vec to hold what are effectively multiple types. Match expressions handle each variant differently."
      },
      {
        q: 'What does Vec::with_capacity(100) do differently from Vec::new()?',
        options: [
          'It creates a vector that can only hold exactly 100 elements',
          'It pre-allocates memory for 100 elements, reducing reallocations as the vector grows',
          'It initializes 100 elements with their default values',
          'It makes the vector fixed-size and non-growable'
        ],
        answer: 1,
        explanation: 'with_capacity(n) allocates enough memory for n elements upfront. The vector still starts with len=0 but has capacity=100. As you push elements, no reallocation is needed until you exceed 100, which avoids repeated costly allocations.'
      }
    ]
  },

  'ch34': {
    title: 'Chapter 34 Quiz: String',
    questions: [
      {
        q: 'What happens to s1 in the expression: let s3 = s1 + &s2;',
        options: [
          's1 is cloned and the clone is used in the concatenation',
          's1 is borrowed immutably and can still be used afterward',
          's1 is moved into the + operation and can no longer be used',
          's1 and s2 are both moved and can no longer be used'
        ],
        answer: 2,
        explanation: 'The + operator uses the add method which takes self (consuming the left operand). s1 is moved into the concatenation. s2 is only borrowed (&s2), so it remains valid. To avoid this, use format!("{}{}", s1, s2) which borrows both.'
      },
      {
        q: 'Why does Rust not allow indexing a String with an integer, like s[0]?',
        options: [
          'Because Rust strings are always immutable and cannot be accessed randomly',
          'Because String is stored on the heap and heap memory cannot be indexed',
          'Because String is UTF-8 encoded and characters can be 1 to 4 bytes wide, so byte index 0 does not reliably correspond to the first character',
          'Because the index operator is reserved for arrays and slices, not strings'
        ],
        answer: 2,
        explanation: 'Rust strings are UTF-8, meaning each character can occupy 1 to 4 bytes. An integer index would refer to a byte position, not a character. Returning a byte might split a multi-byte character in half. Rust refuses this ambiguity entirely.'
      },
      {
        q: 'Which method should you use to iterate over the individual characters (Unicode scalar values) of a Rust String?',
        options: [
          '.bytes() which yields each raw byte as a u8',
          '.chars() which yields each Unicode scalar value as a char',
          '.split("") which splits on every character boundary',
          '.iter() which yields references to each character'
        ],
        answer: 1,
        explanation: '.chars() iterates over Unicode scalar values (char type), which correctly handles multi-byte characters. .bytes() iterates over raw u8 bytes, which is wrong for character-level processing. String does not implement .iter() directly.'
      },
      {
        q: 'What does push_str() take as its argument, and does it take ownership?',
        options: [
          'It takes a String and moves it (takes ownership)',
          'It takes a &str (string slice) and does not take ownership of it',
          'It takes a char and appends it as a one-character string',
          'It takes a Vec<u8> of bytes to append'
        ],
        answer: 1,
        explanation: 'push_str() takes a &str, a string slice, and appends it to the String. Because it takes a reference, it does not take ownership of its argument. You can still use the original string after calling push_str with it.'
      },
      {
        q: 'What is the safest way to get the first N characters from a String that may contain multi-byte UTF-8 characters?',
        options: [
          '&s[0..N] using a byte range',
          's.chars().take(N).collect::<String>()',
          's[0..N].to_string()',
          's.split_at(N).0.to_string()'
        ],
        answer: 1,
        explanation: 's.chars().take(N).collect() iterates over Unicode scalar values, takes the first N of them, and collects them into a new String. This correctly handles multi-byte characters. &s[0..N] is a byte slice and will panic if N falls inside a multi-byte character.'
      }
    ]
  },

  'ch35': {
    title: 'Chapter 35 Quiz: HashMap<K, V>',
    questions: [
      {
        q: 'Which statement correctly brings HashMap into scope in Rust?',
        options: [
          'use HashMap;',
          'use std::map::HashMap;',
          'use std::collections::HashMap;',
          'HashMap is in the prelude and needs no use statement'
        ],
        answer: 2,
        explanation: 'HashMap lives in std::collections and is not included in the prelude. You must write use std::collections::HashMap; at the top of any file that uses it.'
      },
      {
        q: 'What does scores.get(&team_name) return?',
        options: [
          'The value directly as type V',
          'Option<V> where V is the value type',
          'Option<&V> where V is the value type',
          'Result<V, KeyError>'
        ],
        answer: 2,
        explanation: 'HashMap::get() returns Option<&V> — a reference to the value, wrapped in Option. It returns None if the key does not exist. Use .copied() to get Option<V> for Copy types, or .cloned() for Clone types.'
      },
      {
        q: 'What does scores.entry(String::from("Blue")).or_insert(50) do if "Blue" already exists in the map with value 10?',
        options: [
          'It overwrites the existing value 10 with 50',
          'It returns a mutable reference to the existing value 10 without changing it',
          'It panics because the key already exists',
          'It inserts a duplicate entry with value 50'
        ],
        answer: 1,
        explanation: 'or_insert() only inserts the value if the key is not already present. If the key exists, it returns a mutable reference to the existing value without modifying it. This makes the entry API safe for "insert if absent" logic.'
      },
      {
        q: 'What happens to a String value when you insert it into a HashMap with scores.insert(key, value)?',
        options: [
          'The String is cloned and the clone is stored in the HashMap',
          'The String is moved into the HashMap and the original variable is no longer valid',
          'The HashMap stores a reference to the String, which must remain in scope',
          'The String is converted to a &str slice before storage'
        ],
        answer: 1,
        explanation: 'HashMap::insert() takes ownership of both the key and value for non-Copy types like String. After the insert, the original variables are moved and cannot be used. To retain the originals, clone them before inserting.'
      },
      {
        q: 'In the word-count pattern (let count = map.entry(word).or_insert(0); *count += 1;), why is the dereference operator * needed?',
        options: [
          'Because entry() returns a raw pointer that must be dereferenced',
          'Because or_insert() returns &mut V (a mutable reference), and you must dereference it to modify the value it points to',
          'Because += cannot be applied to Option types without dereferencing',
          'Because word_count stores boxed integers that require explicit dereferencing'
        ],
        answer: 1,
        explanation: 'or_insert() returns &mut V, a mutable reference to the value in the map. To modify the value itself rather than the reference, you dereference with *. Without *, you would be trying to reassign the reference variable, not the value it points to.'
      }
    ]
  },

  'ch36': {
    title: 'Chapter 36 Quiz: Result<T, E>',
    questions: [
      {
        q: 'What are the two variants of Result<T, E>?',
        options: [
          'Success(T) and Failure(E)',
          'Ok(T) and Err(E)',
          'Some(T) and None',
          'Right(T) and Left(E)'
        ],
        answer: 1,
        explanation: 'Result<T, E> has exactly two variants: Ok(T) which holds a success value of type T, and Err(E) which holds an error value of type E. Both variants are in the prelude and do not need to be imported.'
      },
      {
        q: 'What does calling .unwrap() on a Result::Err(e) do?',
        options: [
          'It returns a default value of type T',
          'It converts the error to an Ok and returns the error value',
          'It panics with a message that includes the error value',
          'It silently ignores the error and returns unit ()'
        ],
        answer: 2,
        explanation: 'unwrap() on an Err panics with a message showing the debug representation of the error value. This is intentional: unwrap signals "I believe this will succeed and if it does not, something is very wrong." Use expect() to add a human-readable message to the panic.'
      },
      {
        q: 'When is expect() preferable to unwrap()?',
        options: [
          'When you need the program to continue running after an error',
          'When you want to provide a custom message that appears in the panic output, making it easier to find the source of the bug',
          'When the error type does not implement Debug',
          'When the Result is inside an Option'
        ],
        answer: 1,
        explanation: "expect(\"message\") works like unwrap() but prepends your message to the panic output. A message like \"config file should exist after installation\" tells you why this value was assumed to be Ok, making panics much easier to diagnose than the generic unwrap() message."
      },
      {
        q: 'What does result.map(|v| v * 2) do when result is Err(e)?',
        options: [
          'It applies the closure to the error value e',
          'It panics because map cannot be called on Err',
          'It returns Err(e) unchanged, passing the error through',
          'It converts the Err to Ok(0) and then applies the closure'
        ],
        answer: 2,
        explanation: 'map() transforms the value inside Ok without touching Err. If the Result is Err(e), map() returns Err(e) unchanged. This allows chaining transformations without interrupting error propagation.'
      },
      {
        q: 'When is it correct to call unwrap_or_else() on a Result instead of using the ? operator?',
        options: [
          'When the function returns Result and you want to propagate the error',
          'When you want to handle or recover from the error inline with a closure, rather than propagating it to the caller',
          'When the error type does not implement the From trait',
          'When the function returns () and cannot use ?'
        ],
        answer: 1,
        explanation: 'unwrap_or_else takes a closure that runs on Err, letting you provide a fallback value or take a recovery action inline. Use it when the current function can meaningfully handle the error. Use ? when the caller should handle it instead.'
      }
    ]
  },

  'ch37': {
    title: 'Chapter 37 Quiz: Option<T>',
    questions: [
      {
        q: 'What is the key difference between Option<T> in Rust and null in languages like Java or JavaScript?',
        options: [
          'Option<T> can only be used with primitive types, while null works with any type',
          'Option<T> is slower than null because it requires heap allocation',
          'The compiler forces you to handle both the Some and None cases, preventing null pointer dereferences at compile time',
          'Option<T> and null are equivalent; Rust just uses different syntax'
        ],
        answer: 2,
        explanation: "Option<T> makes the possibility of absence explicit in the type system. You cannot use an Option<T> as if it were a T without first pattern matching or calling a method that extracts the value. This eliminates the null pointer dereference errors that are common in languages where null is implicit."
      },
      {
        q: 'What does some_option.unwrap_or(default_value) return?',
        options: [
          'Always returns default_value regardless of whether the option is Some or None',
          'Returns the value inside Some, or returns default_value if the option is None',
          'Returns Some(default_value) if the option is None, or None if the option is Some',
          'Panics if the option is None, returning default_value only on Some'
        ],
        answer: 1,
        explanation: "unwrap_or(default) is the safe alternative to unwrap(). If the option is Some(val), it returns val. If the option is None, it returns the provided default. No panic ever occurs."
      },
      {
        q: 'What does Some(5).map(|n| n * 3) return?',
        options: [
          'Some(5) unchanged',
          'Some(15)',
          '15 as a plain i32',
          'None'
        ],
        answer: 1,
        explanation: 'map() applies the closure to the value inside Some and wraps the result back in Some. Some(5).map(|n| n * 3) returns Some(15). If the option had been None, map would have returned None without calling the closure.'
      },
      {
        q: 'A function returns Option<char> for the last character of the first line of a text. What does it return for an empty string input?',
        options: [
          "Some('\\0') — the null character",
          "Some(' ') — a space character",
          'None — because there is no first line',
          'It panics because the input is empty'
        ],
        answer: 2,
        explanation: "An empty string has no lines, so text.lines().next() returns None. The ? operator (or a match) propagates None immediately, and the function returns None without trying to call .chars().last()."
      },
      {
        q: 'Which method converts an Option<T> into a Result<T, E> by providing an error value for the None case?',
        options: [
          '.ok() which converts Option to Result',
          '.ok_or(error) which converts Some(v) to Ok(v) and None to Err(error)',
          '.map_err(|_| error) which transforms the error type',
          '.transpose() which flips Option and Result'
        ],
        answer: 1,
        explanation: "ok_or(error) converts Some(v) to Ok(v) and None to Err(error). This is useful when you need to use ? in a function returning Result but have a value of type Option. There is also ok_or_else(|| compute_error()) for lazily computing the error."
      }
    ]
  },

  'ch38': {
    title: 'Chapter 38 Quiz: Error Propagation (?)',
    questions: [
      {
        q: 'What does the ? operator do when placed after a Result::Err(e) expression?',
        options: [
          'It prints the error and continues execution',
          'It converts the error to a panic',
          'It immediately returns Err(e) from the current function, propagating the error to the caller',
          'It discards the error and substitutes a default Ok value'
        ],
        answer: 2,
        explanation: '? on Err(e) is equivalent to return Err(From::from(e)). It terminates the current function immediately with an Err, propagating the error up the call stack to the caller. This is the core of error propagation in Rust.'
      },
      {
        q: 'What does the ? operator do when placed after a Result::Ok(val) expression?',
        options: [
          'It wraps val in another Ok layer',
          'It unwraps val and binds it to the result of the expression, allowing execution to continue',
          'It discards val and returns Ok(()) from the function',
          'It panics if val does not match an expected value'
        ],
        answer: 1,
        explanation: '? on Ok(val) simply extracts val and makes it the value of the expression. Execution continues normally. Only Err causes an early return. This is why ? reads like synchronous code: errors are handled implicitly.'
      },
      {
        q: 'What is the role of the From trait in the ? operator?',
        options: [
          'From is required to print error messages with {}',
          '? calls From::from(e) to convert the error type from the expression\'s type to the function\'s return error type',
          'From is required so that errors can be stored in a Vec',
          'From converts Result to Option before propagating'
        ],
        answer: 1,
        explanation: 'When a function returns Result<T, MyError> and you use ? on a Result<T, OtherError>, Rust automatically calls MyError::from(other_error) to convert the error type. This requires implementing From<OtherError> for MyError, allowing ? to work seamlessly across different error types.'
      },
      {
        q: 'What return type must a function have in order to use the ? operator on Result values inside it?',
        options: [
          'The function must return (), which is the unit type',
          'The function must return a Result type (or Option for Option values)',
          'The function must return Box<dyn Any>',
          'Any function can use ?, regardless of return type'
        ],
        answer: 1,
        explanation: '? can only be used in functions whose return type is compatible with the value it is applied to. For Result values, the function must return a Result. For Option values, the function must return an Option. Using ? in a function returning () causes a compile error.'
      },
      {
        q: 'What return type should main() have if you want to use ? throughout the program for mixed error types?',
        options: [
          'main() cannot return a non-unit type in Rust',
          'Result<(), String>',
          'Result<(), Box<dyn std::error::Error>>',
          'Option<()>'
        ],
        answer: 2,
        explanation: 'Result<(), Box<dyn std::error::Error>> allows main() to use ? with any error type that implements the Error trait. Box<dyn Error> is a trait object that accepts io::Error, ParseIntError, and any custom error type that implements Error, making it the universal choice for mixed-error programs.'
      }
    ]
  },

  'ch39': {
    title: 'Chapter 39 Quiz: Custom Error Types',
    questions: [
      {
        q: 'What two traits must a type implement to be usable as an idiomatic Rust error type?',
        options: [
          'Copy and Clone',
          'Debug (via derive) and std::fmt::Display; then implement std::error::Error',
          'PartialEq and Hash',
          'Send and Sync'
        ],
        answer: 1,
        explanation: 'std::error::Error has two supertraits: Debug and Display. Debug is usually derived with #[derive(Debug)]. Display provides the human-readable message and must be implemented manually. Once both are satisfied, implementing the Error trait (which has no required methods beyond the supertraits) marks the type as an error.'
      },
      {
        q: 'What does Box<dyn std::error::Error> as a return type allow?',
        options: [
          'It forces the function to only return io::Error types',
          'It allows the function to return any type that implements the Error trait, useful when multiple different error types can occur',
          'It makes error values heap-allocated, which is required by the ? operator',
          'It automatically implements Display for any error returned'
        ],
        answer: 1,
        explanation: 'Box<dyn Error> is a trait object: a heap-allocated pointer to any type implementing Error. A function returning this type can use ? with io::Error, ParseIntError, or any custom error type, all from the same function without a custom error enum.'
      },
      {
        q: 'Why is an enum a better choice than a struct for a custom error type in most cases?',
        options: [
          'Enums are faster to allocate than structs in Rust',
          'Enums automatically implement Display while structs do not',
          'Enums can represent multiple distinct error variants, allowing callers to match and handle each case differently',
          'Structs cannot implement the Error trait'
        ],
        answer: 2,
        explanation: 'An error enum with variants like NotFound, InvalidInput, and ParseFailed lets callers pattern match to handle each failure mode specifically. A single struct error type forces callers to inspect a field or string message to distinguish errors, which is fragile and error-prone.'
      },
      {
        q: 'What does implementing From<ParseIntError> for MyError enable?',
        options: [
          'It allows MyError to be printed using the {:?} format',
          'It allows the ? operator to automatically convert a ParseIntError into MyError when propagating',
          'It allows MyError to be stored in a Vec<ParseIntError>',
          'It enables pattern matching between MyError and ParseIntError'
        ],
        answer: 1,
        explanation: 'When you use ? on a Result<T, ParseIntError> inside a function returning Result<T, MyError>, Rust calls MyError::from(parse_error) to perform the conversion. Implementing From<ParseIntError> for MyError provides that conversion, making ? work seamlessly across error types.'
      },
      {
        q: 'What does the source() method on std::error::Error return, and why is it important?',
        options: [
          'It returns the file and line number where the error was created',
          'It returns Option<&dyn Error>, the underlying cause of this error, enabling error chain traversal',
          'It returns the error message as a &str',
          'It returns the error code as a u32'
        ],
        answer: 1,
        explanation: "source() returns Option<&dyn Error> representing the lower-level error that caused this error. Implementing source() correctly allows tools and callers to walk the chain of errors (e.g., \"config error caused by parse error caused by invalid digit\") which is essential for diagnosing deeply nested failures."
      }
    ]
  },

  'ch40': {
    title: 'Chapter 40 Quiz: Panic Strategy',
    questions: [
      {
        q: 'What is the difference between unwinding and aborting on panic?',
        options: [
          'Unwinding restarts the program from main(); aborting terminates without restarting',
          'Unwinding walks back the stack and drops each value in reverse order; aborting immediately terminates the process and lets the OS reclaim memory',
          'Unwinding is only available in debug builds; aborting only in release builds',
          'Unwinding panics in every thread; aborting only panics in the current thread'
        ],
        answer: 1,
        explanation: 'Unwinding (the default) walks back up the call stack, running Drop implementations for each value as it goes. This ensures cleanup code runs. Aborting skips all cleanup and exits immediately, which is faster and produces smaller binaries but means Drop code never runs.'
      },
      {
        q: 'How do you see the full call stack at the point of a panic?',
        options: [
          'Add --verbose to cargo run',
          'Set the RUST_BACKTRACE=1 environment variable before running the program',
          'Add #[backtrace] attribute to the panicking function',
          'Panics always show the full call stack by default'
        ],
        answer: 1,
        explanation: 'Setting RUST_BACKTRACE=1 (e.g., RUST_BACKTRACE=1 cargo run) enables a stack trace that shows the sequence of function calls leading to the panic. Start reading the backtrace from the bottom and find the first frame that shows a file you own.'
      },
      {
        q: 'Which situation is most appropriate for calling panic! directly?',
        options: [
          'A file that the user specified on the command line does not exist',
          'A network connection times out during an HTTP request',
          'A function receives arguments that violate a documented contract, indicating a bug in the calling code',
          'A database query returns no rows when at least one was expected'
        ],
        answer: 2,
        explanation: "panic! is for programmer errors: situations that indicate a bug in the code rather than an expected runtime failure. If a function documents 'indices must be in range 0..len' and the caller passes an out-of-range index, that is a bug — panic is correct. File not found, network errors, and empty results are expected failures that should return Result."
      },
      {
        q: 'What Cargo.toml setting changes panic behavior in release builds to terminate immediately without unwinding?',
        options: [
          '[profile.release] optimize = "panic"',
          '[profile.release] panic = "abort"',
          '[release] panic_strategy = "abort"',
          '[build] panic = false'
        ],
        answer: 1,
        explanation: 'Adding panic = "abort" under [profile.release] in Cargo.toml makes release builds abort immediately on panic instead of unwinding. This produces smaller binaries (no unwinding code) and is common for embedded targets where code size is critical.'
      },
      {
        q: 'When is it acceptable to use unwrap() on a Result or Option in Rust code?',
        options: [
          'Never — unwrap() should always be replaced with proper error handling',
          'Only in benchmark code where error handling would skew timing results',
          'In tests, prototypes, and examples, or in production when logic guarantees the value is Ok/Some and a panic would correctly signal a bug',
          'Only in unsafe blocks where the borrow checker does not apply'
        ],
        answer: 2,
        explanation: 'unwrap() is appropriate in tests (where you want panics on failure), prototypes (where you want to focus on logic before wiring up error handling), and production code where you have additional context guaranteeing success and want a clear panic if that guarantee is ever violated. In library code or functions handling user input, prefer returning Result.'
      }
    ]
  }

});
