/* ================================================================
   Module 5: Lifetimes & Memory Safety
   Quizzes: ch27–ch32 (all complete)
   ================================================================ */
Object.assign(QUIZZES, {
  'ch27': {
    title: 'Chapter 27 Quiz: Lifetime Annotations',
    questions: [
      {
        q: 'What does a lifetime in Rust represent?',
        options: [
          'The amount of memory allocated to a variable',
          'The scope during which a reference is guaranteed to be valid',
          'The number of times a value can be borrowed',
          'The time it takes for a value to be dropped'
        ],
        answer: 1,
        explanation: 'A lifetime is the span of code during which a reference is valid. It is not about memory size, borrow counts, or execution time.'
      },
      {
        q: 'Why does the compiler reject the `longest` function without lifetime annotations when it returns a reference?',
        options: [
          'Because string slices cannot be returned from functions',
          'Because the compiler cannot determine at compile time which input reference the return value refers to',
          'Because two parameters of the same type are not allowed',
          'Because &str is not a valid return type in Rust'
        ],
        answer: 1,
        explanation: 'When a function can return one of several input references, the compiler cannot infer which one\'s lifetime governs the return value. Explicit annotations are required to clarify this relationship.'
      },
      {
        q: 'What does the annotation `\'a` in `fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str` tell the compiler?',
        options: [
          'That the function allocates memory for duration \'a',
          'That all three references must outlive the static lifetime',
          'That the returned reference will be valid for at least as long as both x and y are valid',
          'That x and y must have identical lengths'
        ],
        answer: 2,
        explanation: '\'a expresses a constraint: the returned reference is valid for the overlap of the lifetimes of x and y. The compiler uses the shorter of the two concrete lifetimes.'
      },
      {
        q: 'When you pass two references with different concrete lifetimes to `longest<\'a>`, what lifetime does the compiler assign to `\'a`?',
        options: [
          'The longer of the two lifetimes',
          'The lifetime of the first argument',
          'The lifetime of the second argument',
          'The shorter of the two lifetimes'
        ],
        answer: 3,
        explanation: 'The compiler sets \'a to the intersection (shortest overlap) of the two concrete lifetimes. This is the most conservative safe choice, ensuring the returned reference cannot outlive either input.'
      },
      {
        q: 'Which statement about lifetime annotations is true?',
        options: [
          'Lifetime annotations extend how long a value lives in memory',
          'Lifetime annotations only affect how the borrow checker interprets relationships between references',
          'Adding \'static to a reference causes the value to live forever',
          'Lifetime annotations are only required for mutable references'
        ],
        answer: 1,
        explanation: 'Lifetime annotations are descriptive, not prescriptive. They tell the borrow checker how lifetimes relate to each other. They do not extend or shorten the actual life of any value in memory.'
      }
    ]
  },

  'ch28': {
    title: 'Chapter 28 Quiz: Lifetime Elision Rules',
    questions: [
      {
        q: 'What is lifetime elision in Rust?',
        options: [
          'A feature that removes lifetimes from compiled code',
          'A set of compiler rules that automatically infer lifetimes in common patterns, letting you omit explicit annotations',
          'A runtime process that extends reference validity',
          'A linter warning triggered when lifetimes are written unnecessarily'
        ],
        answer: 1,
        explanation: 'Lifetime elision is a set of deterministic rules the compiler applies to infer lifetimes when the pattern is unambiguous. It does not remove lifetimes conceptually; it just lets you omit writing them.'
      },
      {
        q: 'Which elision rule allows `fn first_word(s: &str) -> &str` to compile without explicit annotations?',
        options: [
          'Rule 1 only: each input reference gets its own lifetime',
          'Rules 1 and 2 together: one input gets its own lifetime, and the output inherits it',
          'Rule 3: the output inherits the lifetime of &self',
          'Rule 2 only: the output borrows from the single input'
        ],
        answer: 1,
        explanation: 'Rule 1 assigns \'a to the single input &str. Rule 2 then sees exactly one input lifetime and assigns it to the output &str. Both rules together enable elision here.'
      },
      {
        q: 'Why does `fn ambiguous(x: &str, y: &str) -> &str` fail to compile without annotations?',
        options: [
          'Two &str parameters are not allowed in one function',
          'Rule 1 gives x and y separate lifetimes, and Rule 2 does not apply because there are multiple input lifetimes, so the output lifetime is ambiguous',
          'The return type must be String, not &str, for multi-argument functions',
          'Rule 3 would need &self to resolve the output lifetime'
        ],
        answer: 1,
        explanation: 'Rule 1 assigns \'a to x and \'b to y. Rule 2 requires exactly one input lifetime to assign to the output, but there are two. Rule 3 requires &self. None of the rules resolve the output, so explicit annotation is required.'
      },
      {
        q: 'Elision Rule 3 states that if one of the inputs is `&self` or `&mut self`, the output lifetime is assigned the lifetime of `self`. When does this rule apply?',
        options: [
          'In any function that has a &self parameter anywhere',
          'Only in method definitions on a struct or enum (impl blocks)',
          'Only when the method returns a value of type &Self',
          'In free functions that take a reference named self'
        ],
        answer: 1,
        explanation: 'Rule 3 applies specifically to methods in impl blocks where &self or &mut self is one of the parameters. It does not apply to free functions, and it applies regardless of what type the method returns.'
      },
      {
        q: 'When must you write explicit lifetime annotations instead of relying on elision?',
        options: [
          'Always — elision is only syntactic sugar and must be expanded for production code',
          'When the function has exactly one input reference',
          'When the compiler cannot unambiguously apply the three elision rules to determine all output lifetimes',
          'Only when using mutable references'
        ],
        answer: 2,
        explanation: 'Elision only works when the three rules produce a complete, unambiguous assignment of lifetimes to all output references. When ambiguity remains (such as two input references with no &self), explicit annotations are required.'
      }
    ]
  },

  'ch29': {
    title: "Chapter 29 Quiz: Lifetimes in Structs",
    questions: [
      {
        q: 'Why does Rust require a lifetime annotation on every reference field in a struct?',
        options: [
          'To allocate the correct amount of memory for the field',
          'To prevent the struct instance from outliving the data its reference points to',
          'To allow the struct to be sent across threads',
          'To enable the compiler to garbage-collect the field automatically'
        ],
        answer: 1,
        explanation: 'Without a lifetime annotation the compiler cannot verify that the struct is dropped before the referenced data. The annotation is the written contract that enforces this guarantee at compile time.'
      },
      {
        q: 'Which syntax correctly declares a struct that holds a borrowed string slice?',
        options: [
          "struct View { text: &str }",
          "struct View<'a> { text: &'a str }",
          "struct View { text: &'static str }",
          "struct<'a> View { text: &'a str }"
        ],
        answer: 1,
        explanation: "The lifetime parameter 'a must be declared in angle brackets after the struct name, and then used on the reference field. The parameter goes after the struct name, not after the struct keyword."
      },
      {
        q: "When writing impl methods for a struct Wrapper<'a>, where must the lifetime parameter appear?",
        options: [
          "Only after the struct name: impl Wrapper<'a>",
          "Only after the impl keyword: impl<'a> Wrapper",
          "After both impl and the struct name: impl<'a> Wrapper<'a>",
          "It is optional and can be omitted entirely in impl blocks"
        ],
        answer: 2,
        explanation: "The lifetime parameter must be declared after impl (making it available for the block) and used after the struct name (connecting it to the struct's existing parameter). Both positions are required."
      },
      {
        q: 'A struct has two reference fields that can independently come from different data sources. What is the best approach?',
        options: [
          "Use a single 'a parameter for both fields to keep the syntax simple",
          "Use 'static for both fields to avoid the problem entirely",
          "Use two separate lifetime parameters, one per field",
          "Ownership does not support two reference fields in one struct"
        ],
        answer: 2,
        explanation: 'Using a single lifetime parameter forces both fields to share the shorter of the two source lifetimes, which is unnecessarily restrictive. Two separate parameters allow each field to be tied to its own source independently.'
      },
      {
        q: 'Which scenario most justifies using a reference field in a struct rather than an owned field?',
        options: [
          'The struct is stored in a HashMap and retrieved by multiple callers',
          'The struct is a short-lived view over a large document being parsed in one function',
          'The struct is passed across thread boundaries using std::thread::spawn',
          'The struct is returned from a constructor function as the primary API entry point'
        ],
        answer: 1,
        explanation: 'Reference fields shine for short-lived view structs that inspect existing data without copying it. Long-lived, cross-boundary, or thread-shared structs should prefer owned fields to avoid complex lifetime bookkeeping.'
      }
    ]
  },

  'ch30': {
    title: "Chapter 30 Quiz: The 'static Lifetime",
    questions: [
      {
        q: "What does the 'static lifetime mean for a reference?",
        options: [
          'The referenced value cannot be mutated',
          'The reference is valid for the entire duration of the program',
          'The referenced value is stored on the stack',
          'The referenced value is allocated in a static memory pool'
        ],
        answer: 1,
        explanation: "'static is the widest possible lifetime: it guarantees the reference will remain valid for as long as the program runs. It says nothing about mutability or stack vs heap placement."
      },
      {
        q: 'Why do all string literals in Rust have the &\'static str type?',
        options: [
          'Because they are immutable and Rust marks all immutable values as static',
          'Because the Rust runtime allocates them in a special static pool at startup',
          'Because their text is embedded directly in the compiled binary, which exists for the entire program run',
          'Because they are interned by the compiler and shared across all uses'
        ],
        answer: 2,
        explanation: "String literals are baked into the program's binary at compile time. Since the binary exists for the entire execution of the program, any reference to a string literal is guaranteed to be valid for 'static."
      },
      {
        q: "What does the generic bound T: 'static require of T?",
        options: [
          "T must be a reference with a 'static lifetime",
          "T must be a string literal or a static variable",
          "T must not contain any non-static references (T itself can be an owned type)",
          "T must implement the Copy trait"
        ],
        answer: 2,
        explanation: "T: 'static means T contains no borrowed references, or only references with the 'static lifetime. Owned types like String, Vec<i32>, and i32 all satisfy this bound because they contain no borrowed references."
      },
      {
        q: "A compiler error suggests adding 'static to fix a lifetime problem. What should you do first?",
        options: [
          "Add 'static immediately — the compiler suggestion is always the correct fix",
          "Investigate whether the real problem is a dangling reference or mismatched scope, and fix that instead",
          "Replace all &str parameters with String to avoid the issue",
          "Wrap the value in Box::new() to extend its lifetime"
        ],
        answer: 1,
        explanation: "The compiler sometimes suggests 'static as one possible fix, but it also warns that this is uncommon. The root cause is almost always a dangling reference or a value going out of scope too soon. Fix that root cause rather than papering over it with 'static."
      },
      {
        q: "Which of the following values satisfies a T: 'static bound?",
        options: [
          "A reference to a local String variable inside a function",
          "A struct that contains a &'a str field where 'a is a regular (non-static) lifetime",
          "An owned String created with String::from(\"hello\")",
          "A closure that captures a reference to a local variable"
        ],
        answer: 2,
        explanation: "An owned String contains no borrowed references, so it satisfies T: 'static. Local references and structs containing non-static references do not satisfy this bound because they might become invalid before the program ends."
      }
    ]
  },

  'ch31': {
    title: 'Chapter 31 Quiz: Designing Lifetime-Safe APIs',
    questions: [
      {
        q: 'What is the first question to ask before annotating lifetime parameters on a function that returns a reference?',
        options: [
          'How many input parameters does the function have?',
          'Does the function need to return a reference at all, or would an owned value be simpler?',
          'Is the function going to be called from multiple threads?',
          'Does the function use generics anywhere in its signature?'
        ],
        answer: 1,
        explanation: 'Returning owned values (String, Vec, etc.) eliminates all lifetime annotations and is almost always simpler. Only return a reference when the function is slicing or finding into existing input data, not when it creates new data.'
      },
      {
        q: "In fn process<'a>(x: &'a str, y: &str) -> &'a str, what does the annotation communicate?",
        options: [
          "Both x and y must live as long as the return value",
          "The return value's lifetime is tied to x only; y's lifetime is irrelevant to the output",
          "The function always returns a 'static reference",
          "x and y must have the same lifetime"
        ],
        answer: 1,
        explanation: "Only x carries the 'a annotation on both the parameter and the return type. y is unannotated relative to the output, meaning the caller does not need to keep y alive for as long as they use the return value. This is a more honest and less restrictive contract."
      },
      {
        q: 'A struct LineReader holds a reference to a string document. When next_line() returns Option<&\'a str>, why is the lifetime \'a tied to the document and not to &self?',
        options: [
          "Because &self automatically has the 'static lifetime",
          "So callers can collect the returned slices and use them after the LineReader is dropped, as long as the document is still alive",
          "Because the compiler requires all method return types to use the struct's lifetime parameter",
          "To prevent the LineReader from being moved after next_line is called"
        ],
        answer: 1,
        explanation: "Tying the returned slices to 'a (the document's lifetime) rather than to &self allows callers to hold onto the slices independently of the reader. The slices remain valid as long as the original document string exists, even if the LineReader itself is dropped."
      },
      {
        q: 'Which type of struct is the best candidate for reference fields with explicit lifetime annotations?',
        options: [
          'A builder struct that accumulates data over many method calls before producing a result',
          'A struct stored in a Vec and accessed from multiple call sites',
          'A short-lived view or parser struct that inspects existing data without copying it',
          'A struct that is sent to another thread using std::thread::spawn'
        ],
        answer: 2,
        explanation: 'View and parser structs are the ideal use case for reference fields: they are short-lived, the source data is already owned by the caller, and avoiding copies is the primary motivation. Builders, collections, and thread-shared structs all benefit from owned fields instead.'
      },
      {
        q: 'What is the benefit of naming a lifetime parameter &\'doc instead of &\'a in a struct definition?',
        options: [
          "It changes the actual lifetime rules that the compiler enforces",
          "It allows the struct to hold references to multiple documents simultaneously",
          "It serves as self-documenting code, making it clear that slices borrow from the source document",
          "It enables the struct to be used without importing any lifetime traits"
        ],
        answer: 2,
        explanation: "Lifetime parameter names are just labels. 'doc vs 'a makes no difference to the compiler. But a descriptive name like 'doc communicates intent to human readers: any reference tagged 'doc borrows from the original document, not from some unrelated source."
      }
    ]
  },

  'ch32': {
    title: 'Chapter 32 Quiz: Debugging Lifetime Errors',
    questions: [
      {
        q: 'What does compiler error E0597 ("does not live long enough") indicate?',
        options: [
          'A value was declared but never used',
          'A reference is being used after the value it points to has been dropped',
          'A function is missing a return statement',
          'A type does not implement the required trait'
        ],
        answer: 1,
        explanation: 'E0597 means a borrow outlives its referent. The compiler identifies exactly which variable was dropped too early and where the borrow is still being used. The fix is to either extend the source value\'s scope or stop using the reference after the source is dropped.'
      },
      {
        q: 'What does error E0515 ("cannot return reference to local variable") indicate, and what is the most reliable fix?',
        options: [
          'The function has too many parameters. Fix: reduce the number of parameters.',
          'A function is returning a reference to data it created internally, which will be dropped at the function\'s end. Fix: return the owned value instead.',
          'The return type annotation is missing. Fix: add an explicit return type.',
          'The local variable needs to be declared as static. Fix: add the static keyword.'
        ],
        answer: 1,
        explanation: 'When a function creates data (e.g., via format! or String::from) and tries to return a reference to it, the data is dropped when the function returns, leaving a dangling reference. The fix is to return the owned String or Vec directly instead of a reference to it.'
      },
      {
        q: 'The compiler shows error E0106 ("missing lifetime specifier") on a function that takes two &str parameters and returns a &str. What is the correct next step?',
        options: [
          "Add 'static to the return type to eliminate the error",
          "Add a lifetime parameter 'a to both input parameters and the return type, connecting the output to the inputs it can actually come from",
          'Change both &str parameters to String to avoid the need for lifetime annotations',
          'Split the function into two separate functions, one per parameter'
        ],
        answer: 1,
        explanation: "E0106 on a function that returns a reference means the compiler cannot determine which input the output borrows from. The fix is to add a named lifetime parameter connecting the output to the relevant input(s). If the function can return either input, annotate both with 'a."
      },
      {
        q: 'You have a struct Cache { data: &str } and get E0106. What are the two correct ways to fix this?',
        options: [
          "Add 'static to the field: Cache { data: &'static str }, or wrap it in Option",
          "Add a lifetime parameter: Cache<'a> { data: &'a str }, or change the field to an owned String",
          'Remove the reference and use a raw pointer instead, or use unsafe to bypass the check',
          "Use Box<str> instead of &str, or add the Copy trait to the struct"
        ],
        answer: 1,
        explanation: "The two idiomatic fixes are: add a lifetime parameter so the struct is a borrowed view over external data (Cache<'a>), or change the field to an owned String so the struct owns its data and needs no lifetime annotation at all."
      },
      {
        q: 'After reading a lifetime error, the compiler suggests "consider using the \'static lifetime." When should you follow this suggestion?',
        options: [
          'Always — the compiler suggestion is the canonical fix for lifetime errors',
          "When the data you are referencing is actually a string literal or a static variable that truly lives for the entire program",
          'When you want to prevent the value from being dropped during the program',
          "Whenever the compiler says E0597 or E0515, 'static is the correct response"
        ],
        answer: 1,
        explanation: "Follow the 'static suggestion only when the referenced data genuinely lives for the entire program (a string literal, a static variable, or a global constant). In all other cases, fix the root cause: extend the value's scope, shorten the borrow, or return owned data."
      }
    ]
  }
});
