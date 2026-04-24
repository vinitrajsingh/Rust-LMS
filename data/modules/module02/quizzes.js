/* ================================================================
   Module 2 Quizzes — 5 questions per chapter
   ================================================================ */
Object.assign(QUIZZES, {

  'ch05': {
    title: 'Chapter 5 Quiz: Variables, Mutability & Shadowing',
    questions: [
      {
        q: 'What is the output of this program?\n\nfn main() {\n    let x = 5;\n    let x = x + 1;\n    {\n        let x = x * 2;\n        println!("{}", x);\n    }\n    println!("{}", x);\n}',
        options: [
          '12, then 5',
          '12, then 6',
          '6, then 6',
          '10, then 6'
        ],
        answer: 1,
        explanation: 'The inner block shadows x as (5+1)*2 = 12, but that shadow only lives inside the block. Outside the block, x is still 6 (from the second let x = x + 1).'
      },
      {
        q: 'Which of these correctly declares a constant in Rust?',
        options: [
          'const LIMIT = 100;',
          'let const LIMIT: u32 = 100;',
          'const LIMIT: u32 = 100;',
          'constant LIMIT: u32 = 100;'
        ],
        answer: 2,
        explanation: 'Constants use the const keyword, require an explicit type annotation (u32 here), and follow SCREAMING_SNAKE_CASE naming. Omitting the type annotation is a compile error.'
      },
      {
        q: 'You write: let mut color = "red"; color = color.len(); What happens?',
        options: [
          'It compiles and color becomes 3',
          'It compiles and prints nothing',
          'A compile error: mismatched types (expected &str, found usize)',
          'A runtime panic'
        ],
        answer: 2,
        explanation: 'mut allows reassignment but not type changes. color was declared as &str; assigning a usize (the result of .len()) to it is a type mismatch the compiler catches immediately.'
      },
      {
        q: 'What is the fundamental difference between shadowing a variable and using mut?',
        options: [
          'mut creates a new variable; shadowing modifies the existing one in place',
          'Shadowing creates a new variable and can change the type; mut modifies the existing value but cannot change the type',
          'They are identical in behavior; shadowing is just older Rust syntax',
          'Shadowing only works inside inner scopes, never at the top level of a function'
        ],
        answer: 1,
        explanation: 'Shadowing always creates a brand-new variable (requiring let each time) and can change the type. mut modifies the same memory location in place and the type is permanently fixed at declaration.'
      },
      {
        q: 'A variable is declared as: let _count = 0; Why is the underscore prefix used?',
        options: [
          'It marks the variable as mutable',
          'It makes the variable a constant',
          'It tells the compiler to suppress the "unused variable" warning',
          'It makes the variable private to the current module'
        ],
        answer: 2,
        explanation: 'Rust warns about declared-but-never-used variables. Prefixing the name with _ is a convention that signals intentional disuse, silencing the warning without removing the declaration.'
      }
    ]
  },


  'ch06': {
    title: 'Chapter 6 Quiz: Primitive Types',
    questions: [
      {
        q: 'What is the default integer type in Rust when you write let x = 42; without an annotation?',
        options: ['u32', 'i64', 'i32', 'usize'],
        answer: 2,
        explanation: 'Rust defaults to i32 for integer literals when no type annotation or context narrows the choice. It is a 32-bit signed integer and covers the range needed for most everyday integers.'
      },
      {
        q: 'Which of these correctly creates an array of five elements all set to zero?',
        options: [
          'let a = [0, 0, 0, 0, 0];',
          'let a = [0; 5];',
          'let a: [i32] = [0; 5];',
          'Both A and B are correct'
        ],
        answer: 3,
        explanation: 'Both [0, 0, 0, 0, 0] and [0; 5] produce an identical array. The [value; count] shorthand is more concise and is idiomatic when all elements share the same initial value.'
      },
      {
        q: 'What happens when an u8 holding the value 255 has 1 added to it in debug mode?',
        options: [
          'It silently wraps to 0',
          'The compiler rejects the code',
          'The program panics at runtime with an overflow error',
          'It becomes 256 and the type is automatically widened'
        ],
        answer: 2,
        explanation: 'In debug mode (cargo run without --release), Rust includes overflow checks. Adding 1 to a u8 holding 255 would exceed the type\'s maximum, so the program panics at runtime. In release mode it wraps silently.'
      },
      {
        q: 'Which statement about char in Rust is correct?',
        options: [
          'char holds one byte and can only represent ASCII characters',
          'char is declared with double quotes and is 1 byte',
          'char is 4 bytes and can represent any Unicode scalar value',
          'char and &str are interchangeable for single-character text'
        ],
        answer: 2,
        explanation: 'Rust\'s char is 4 bytes wide and represents a Unicode scalar value, so it can hold characters from any human language plus symbols and emoji. It must be declared with single quotes, not double quotes.'
      },
      {
        q: 'You write: let a: u8 = 10; let b: i32 = 5; let c = a + b; What happens?',
        options: [
          'It compiles; Rust automatically widens u8 to i32',
          'It compiles; the result type is u8',
          'A compile error: cannot add u8 and i32 without an explicit cast',
          'A runtime panic if the result overflows u8'
        ],
        answer: 2,
        explanation: 'Rust never implicitly converts between numeric types. To add a u8 and an i32, you must cast explicitly: a as i32 + b. This forces the programmer to think about potential value loss and prevents silent bugs.'
      }
    ]
  },


  'ch07': {
    title: 'Chapter 7 Quiz: Expressions vs Statements',
    questions: [
      {
        q: 'What does this code print?\n\nfn main() {\n    let result = {\n        let x = 4;\n        x * 3;\n    };\n    println!("{:?}", result);\n}',
        options: [
          '12',
          'x * 3',
          '()',
          'A compile error'
        ],
        answer: 2,
        explanation: 'The last line in the block is x * 3; — with a semicolon. The semicolon turns it into a statement and discards the value 12. The block then returns (), the unit type. println!("{:?}", ()) prints ().'
      },
      {
        q: 'Which of the following is a statement in Rust?',
        options: [
          'x + 1',
          '{ let a = 5; a }',
          'let y = 10;',
          '"hello"'
        ],
        answer: 2,
        explanation: 'A let binding (let y = 10;) is a statement: it performs an action (creates a binding) but does not return a value. The other options are all expressions that evaluate to values.'
      },
      {
        q: 'Why does this code NOT compile?\n\nfn main() {\n    let flag = true;\n    let v = if flag { 100 } else { "hundred" };\n}',
        options: [
          'You cannot use if as an expression',
          'The two branches return different types (i32 vs &str)',
          'flag must be declared as mut',
          'else is not allowed when if is used as an expression'
        ],
        answer: 1,
        explanation: 'When if is used as an expression, every branch must return the same type. Here one branch returns i32 (100) and the other returns &str ("hundred"). Rust cannot resolve a single type for the result, so it refuses to compile.'
      },
      {
        q: 'What does a code block { } that ends with a semicoloned expression return?',
        options: [
          'The value of the last expression before the semicolon',
          'The value of the first expression in the block',
          'Nothing; it causes a compile error',
          '() (the unit type)'
        ],
        answer: 3,
        explanation: 'A semicolon after an expression converts it to a statement and discards its value. A block whose last line is a statement returns () (unit), not the discarded value.'
      },
      {
        q: 'In Rust, why can you NOT write let x = (let y = 5);?',
        options: [
          'let inside parentheses requires a type annotation',
          'A let binding is a statement, not an expression, so it produces no value to assign',
          'Nested let bindings are only allowed inside functions',
          'Parentheses cannot contain let bindings for performance reasons'
        ],
        answer: 1,
        explanation: 'let is a statement in Rust, not an expression. Statements do not produce a value, so there is nothing to assign to x. This design prevents the accidental assignment-as-condition bug common in C (if (x = 5) instead of if (x == 5)).'
      }
    ]
  },


  'ch08': {
    title: 'Chapter 8 Quiz: Control Flow',
    questions: [
      {
        q: 'What does the range 1..5 produce when used in a for loop?',
        options: [
          '1, 2, 3, 4, 5',
          '1, 2, 3, 4',
          '2, 3, 4, 5',
          '1, 2, 3, 4, 5, 6'
        ],
        answer: 1,
        explanation: 'The .. range operator in Rust is exclusive at the end. 1..5 generates the values 1, 2, 3, 4. To include 5, use the inclusive range operator ..= : 1..=5 generates 1, 2, 3, 4, 5.'
      },
      {
        q: 'What is the output of this code?\n\nfn main() {\n    let result = loop {\n        break 42;\n    };\n    println!("{}", result);\n}',
        options: [
          'A compile error: loop cannot return a value',
          '42',
          '()',
          'An infinite loop with no output'
        ],
        answer: 1,
        explanation: 'loop is an expression in Rust. Placing a value after break makes that value the result of the loop expression. Here break 42 causes the loop to exit and evaluate to 42, which is then assigned to result.'
      },
      {
        q: 'Which loop type is generally preferred in idiomatic Rust for iterating over a collection?',
        options: [
          'loop with manual index tracking',
          'while with a counter variable',
          'for ... in',
          'All three are equally preferred'
        ],
        answer: 2,
        explanation: 'The for...in loop is preferred for collection iteration in Rust. It is safe (no manual index, no out-of-bounds risk), concise, and clearly expresses intent. The Rust Book recommends it specifically over while-based index loops.'
      },
      {
        q: 'You have two nested loops and want to exit the outer loop from inside the inner loop. What must you use?',
        options: [
          'return, which exits both loops and the function',
          'A loop label on the outer loop, then break with that label',
          'Two separate break statements',
          'A boolean flag variable checked at the outer loop level'
        ],
        answer: 1,
        explanation: 'A plain break only exits the innermost enclosing loop. To exit an outer loop, you attach a label to it (e.g., \'outer: loop) and then use break \'outer; from any nested depth. The label syntax uses a single-quote prefix.'
      },
      {
        q: 'What happens when you write if 1 { println!("yes"); } in Rust?',
        options: [
          'It prints "yes" because 1 is truthy like in C',
          'It prints nothing because 1 is falsy',
          'A compile error: expected bool, found integer',
          'A runtime panic'
        ],
        answer: 2,
        explanation: 'Rust requires the condition of an if expression to be exactly a bool type. Integers are never implicitly converted to booleans. Writing if 1 is a type error caught at compile time. You must write if 1 != 0 to achieve the intended effect.'
      }
    ]
  },


  'ch09': {
    title: 'Chapter 9 Quiz: Functions',
    questions: [
      {
        q: 'In Rust, what naming convention is used for function names?',
        options: [
          'camelCase (e.g., calculateTotal)',
          'PascalCase (e.g., CalculateTotal)',
          'snake_case (e.g., calculate_total)',
          'SCREAMING_SNAKE_CASE (e.g., CALCULATE_TOTAL)'
        ],
        answer: 2,
        explanation: 'Function names in Rust use snake_case: all lowercase letters with words separated by underscores. SCREAMING_SNAKE_CASE is used for constants, and PascalCase is used for types and structs. The compiler will warn you if you deviate from these conventions.'
      },
      {
        q: 'Why does this function fail to compile?\n\nfn add_one(x: i32) -> i32 {\n    x + 1;\n}',
        options: [
          'The parameter type i32 is wrong',
          'The return type i32 is wrong',
          'The semicolon on x + 1 turns it into a statement, so the function returns () instead of i32',
          'You cannot use + inside a function body'
        ],
        answer: 2,
        explanation: 'A semicolon after an expression turns it into a statement that discards its value. The function then returns () (unit) by default. Since the signature declares -> i32, this is a type mismatch. Remove the semicolon to fix it.'
      },
      {
        q: 'What is the idiomatic way to return a value from a Rust function for the normal (non-early) case?',
        options: [
          'Write return value; at the end of the function',
          'Write the expression as the last line of the function body without a semicolon',
          'Store the result in a variable named result and write return result',
          'Call output(value) at the end of the function'
        ],
        answer: 1,
        explanation: 'The idiomatic Rust style is to use a tail expression: write the return value as the last expression in the function body without a semicolon. The explicit return keyword is reserved for early returns (guard clauses, loop exits, etc.).'
      },
      {
        q: 'When should you use the explicit return keyword in a Rust function?',
        options: [
          'Always; implicit returns are bad practice',
          'Never; Rust does not support the return keyword',
          'Only when the function returns a boolean',
          'When you need to exit the function early, before reaching the end of the body'
        ],
        answer: 3,
        explanation: 'The return keyword is used for early returns, such as guard clauses that handle edge cases at the top of a function. For the normal return path at the end of a function, the idiomatic style is a tail expression (no semicolon).'
      },
      {
        q: 'Which of these function signatures is valid in Rust?',
        options: [
          'fn greet(name) { println!("{}", name); }',
          'fn add(a, b: i32) -> i32 { a + b }',
          'fn multiply(a: i32, b: i32) -> i32 { a * b }',
          'fn say_hi() -> { println!("hi"); }'
        ],
        answer: 2,
        explanation: 'Every parameter must have a type annotation, and the return type (if present) must follow ->. Option C is the only signature that satisfies all these rules: both parameters have type annotations, and the return type is correctly specified after ->.'
      }
    ]
  },


  'ch10': {
    title: 'Chapter 10 Quiz: Pattern Matching Basics',
    questions: [
      {
        q: 'Why does Rust require match expressions to be exhaustive?',
        options: [
          'It is a performance optimization that allows the compiler to skip branch prediction',
          'It ensures all possible values are handled, preventing silent unhandled cases at runtime',
          'It is required only for enums, not for integer or boolean matches',
          'It is optional; the compiler only warns, not errors, when cases are missing'
        ],
        answer: 1,
        explanation: 'Exhaustiveness is a compile-time safety guarantee. The compiler verifies that every possible value is covered by at least one arm. This means you can never accidentally silently ignore a new variant added to an enum — the compiler will force you to handle it.'
      },
      {
        q: 'What does the _ pattern do in a match arm?',
        options: [
          'It matches only the value zero',
          'It is a wildcard that matches any value but does not bind it to a name',
          'It causes the match to return the unit type ()',
          'It only matches values that were not matched by earlier arms when combined with |'
        ],
        answer: 1,
        explanation: '_ is a catch-all (wildcard) pattern that matches any value. Unlike a named variable pattern, it does not bind the matched value to a name — the value is simply discarded. It is commonly used as the last arm to satisfy exhaustiveness.'
      },
      {
        q: 'What is the output of this code?\n\nfn main() {\n    let n = 13;\n    let label = match n {\n        2 | 3 | 5 | 7 | 11 | 13 => "prime",\n        1..=10 => "small",\n        _ => "other",\n    };\n    println!("{}", label);\n}',
        options: [
          'small',
          'prime',
          'other',
          'A compile error: overlapping patterns'
        ],
        answer: 1,
        explanation: 'Patterns are tested in order. The first arm 2 | 3 | 5 | 7 | 11 | 13 includes 13, so it matches before the range 1..=10 is even checked. Output is "prime". Note that even though 13 > 10, the first matching arm always wins.'
      },
      {
        q: 'You want to match all values except 0 and print what the value is. Which arm is correct?',
        options: [
          '_ => println!("got something")',
          'other => println!("got {}", other)',
          '!0 => println!("nonzero")',
          'n if n != 0 => println!("got {}", n)'
        ],
        answer: 1,
        explanation: 'A named variable pattern (other) acts as a catch-all AND binds the matched value to the name so you can use it in the arm\'s code. _ also catches everything but discards the value. Option D (a match guard) is also valid Rust but was not covered in this chapter yet.'
      },
      {
        q: 'From Chapter 8 (Ranges): Which range syntax includes the end value?',
        options: [
          '1..5 includes 5',
          '1..=5 includes 5',
          'Both 1..5 and 1..=5 include 5',
          'Neither; ranges in Rust are always exclusive at both ends'
        ],
        answer: 1,
        explanation: 'The ..= operator creates an inclusive range. 1..=5 produces 1, 2, 3, 4, 5. The plain .. operator is exclusive at the end: 1..5 produces 1, 2, 3, 4. This applies both to for loops and to range patterns in match arms.'
      }
    ]
  },


  'ch11': {
    title: 'Chapter 11 Quiz: Basic Input/Output',
    questions: [
      {
        q: 'What is the difference between print! and println! in Rust?',
        options: [
          'print! outputs to stderr; println! outputs to stdout',
          'println! appends a newline after the output; print! does not',
          'print! requires a format string; println! does not',
          'println! can only print strings; print! can print any type'
        ],
        answer: 1,
        explanation: 'The only difference is the newline: println! adds \\n at the end, while print! does not. Both print to stdout. For stderr output use eprintln! and eprint! respectively.'
      },
      {
        q: 'Why must the String buffer passed to read_line be declared with mut?',
        options: [
          'read_line creates a new String and overwrites the variable',
          'read_line appends data to the String, which requires a mutable reference',
          'String::new() always returns a mutable String by default',
          'The use std::io; import requires all String variables to be mutable'
        ],
        answer: 1,
        explanation: 'read_line takes &mut String — a mutable reference — because it needs to append the user\'s input to the existing String. Rust enforces that you can only get a mutable reference to a variable declared with mut.'
      },
      {
        q: 'A user types "42" and presses Enter. After read_line, your String buffer contains "42\\n". Which method removes the trailing newline before parsing?',
        options: [
          '.strip()',
          '.chomp()',
          '.trim()',
          '.clean()'
        ],
        answer: 2,
        explanation: '.trim() removes leading and trailing whitespace from a string slice, including the \\n (or \\r\\n on Windows) that read_line appends when the user presses Enter. Without it, parse() will fail because "42\\n" is not a valid integer.'
      },
      {
        q: 'Which format specifier would you use to print an array like [1, 2, 3] in Rust?',
        options: [
          '{}',
          '{:d}',
          '{:?}',
          '{:a}'
        ],
        answer: 2,
        explanation: '{:?} is the Debug format and works for most Rust types including arrays, tuples, and vectors. The {} (Display) format requires the type to implement the Display trait, which arrays do not. Use {:#?} for a prettier indented version.'
      },
      {
        q: 'From Chapter 10 (Pattern Matching): What is the safest way to handle a failed parse() call when reading user input?',
        options: [
          'Always use .expect() which guarantees the program keeps running',
          'Use match on the Result returned by parse(), handling Ok(n) and Err(_) separately',
          'Wrap parse() in a try block',
          'The compiler guarantees parse() never fails on valid UTF-8 strings'
        ],
        answer: 1,
        explanation: 'parse() returns a Result<T, E>. Using match lets you handle both the Ok(n) case (successful parse, value is n) and the Err(_) case (invalid input) gracefully without crashing. .expect() is simpler but panics on failure, which is not safe for user-provided input.'
      }
    ]
  },

});
