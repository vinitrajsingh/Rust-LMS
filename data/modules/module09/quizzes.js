Object.assign(QUIZZES, {

  'ch54': {
    title: 'Chapter 54 Quiz: Modules & Visibility',
    questions: [
      {
        q: 'What is the default visibility of an item declared inside a module in Rust?',
        options: [
          'Public — visible everywhere',
          'Private — visible only within the module and its descendants',
          'pub(crate) — visible within the crate',
          'pub(super) — visible to the parent module'
        ],
        answer: 1,
        explanation: 'Without any visibility keyword, items are private by default, meaning they are only accessible within the module they are defined in and any child modules.'
      },
      {
        q: 'Which keyword is used to bring a path into the current scope to avoid writing it repeatedly?',
        options: ['mod', 'pub', 'use', 'extern'],
        answer: 2,
        explanation: 'The `use` keyword creates a shortcut by bringing a path into the current scope, so you can refer to items without writing their full path every time.'
      },
      {
        q: 'Given the code `pub(crate) fn helper() {}`, where can `helper` be called?',
        options: [
          'Only within the same module',
          'Anywhere within the same crate, but not by external users',
          'Anywhere, including external crates',
          'Only by the parent module'
        ],
        answer: 1,
        explanation: '`pub(crate)` restricts visibility to the current crate only. External crates that depend on this library cannot call the function.'
      },
      {
        q: 'You write `mod network;` with a semicolon in `src/main.rs`. Where does Rust look for the module\'s content?',
        options: [
          'It creates an inline empty module',
          'It looks for `src/network/mod.rs` or `src/network.rs`',
          'It looks for `network.rs` in the project root',
          'It generates the module automatically'
        ],
        answer: 1,
        explanation: 'A `mod name;` declaration with a semicolon (not a block) tells Rust to load the module from a file: either `src/name.rs` or `src/name/mod.rs`.'
      },
      {
        q: 'What does `pub use some::deep::Type;` accomplish in a library\'s `lib.rs`?',
        options: [
          'It makes Type private and renames it',
          'It imports Type for internal use only',
          'It re-exports Type so external users can access it at the top-level path',
          'It copies the source code of Type into lib.rs'
        ],
        answer: 2,
        explanation: '`pub use` re-exports an item, making it accessible from the module where the `pub use` statement appears. This is used to create clean, flat public APIs from deeply nested internal structures.'
      }
    ]
  },

  'ch55': {
    title: 'Chapter 55 Quiz: Crate Architecture',
    questions: [
      {
        q: 'What is the key difference between a binary crate and a library crate in Rust?',
        options: [
          'A binary crate uses `lib.rs`; a library crate uses `main.rs`',
          'A binary crate produces an executable with a `main` function; a library crate produces code for others to use',
          'Binary crates cannot have dependencies; library crates can',
          'Library crates are compiled faster than binary crates'
        ],
        answer: 1,
        explanation: 'A binary crate\'s entry point is `src/main.rs` and produces an executable program. A library crate\'s entry point is `src/lib.rs` and produces a reusable `.rlib` artifact for other crates to link against.'
      },
      {
        q: 'Which file is the crate root for a library crate?',
        options: ['src/main.rs', 'src/lib.rs', 'Cargo.toml', 'src/mod.rs'],
        answer: 1,
        explanation: 'For library crates, `src/lib.rs` is the crate root — the file Rust starts compiling from. All other modules must be declared (directly or transitively) from this file.'
      },
      {
        q: 'In `Cargo.toml`, what section lists crates that are ONLY needed during testing and are NOT included in the final library?',
        options: ['[dependencies]', '[build-dependencies]', '[dev-dependencies]', '[test-dependencies]'],
        answer: 2,
        explanation: '`[dev-dependencies]` are only compiled when running `cargo test` or `cargo bench`. They are not included in your library when it is used by downstream crates, keeping the published dependency footprint small.'
      },
      {
        q: 'You have `src/lib.rs` and `src/main.rs` in the same Cargo package. What is true?',
        options: [
          'This is an error — a package can only have one crate',
          'The package has both a library crate and a binary crate; main.rs can use the library by its package name',
          'main.rs automatically includes all code from lib.rs without any import',
          'You must create a workspace to have both files'
        ],
        answer: 1,
        explanation: 'A single Cargo package can contain both a `src/lib.rs` (library crate) and a `src/main.rs` (binary crate). The binary can use the library with `use package_name::...`, the same way external crates would.'
      },
      {
        q: 'Where should you place a second executable called `worker` in a Cargo project that already has `src/main.rs`?',
        options: [
          'Create `src/worker.rs` and declare `mod worker;` in main.rs',
          'Create `src/bin/worker.rs`',
          'Add a `[[bin]]` entry pointing to `src/main.rs`',
          'Create a second `Cargo.toml` in the same directory'
        ],
        answer: 1,
        explanation: 'Files placed in `src/bin/` automatically become separate executable targets. Running `cargo run --bin worker` executes `src/bin/worker.rs`.'
      }
    ]
  },

  'ch56': {
    title: 'Chapter 56 Quiz: Workspaces',
    questions: [
      {
        q: 'What is the main benefit of a shared `Cargo.lock` in a workspace?',
        options: [
          'It prevents any crate from adding new dependencies',
          'It ensures all workspace members use exactly the same versions of shared dependencies',
          'It speeds up compilation by disabling dependency resolution',
          'It merges all member crates into a single crate'
        ],
        answer: 1,
        explanation: 'A single `Cargo.lock` at the workspace root means all member crates resolve to identical dependency versions, eliminating version mismatches between crates in the same project.'
      },
      {
        q: 'In a workspace, how does `cli_app` declare a dependency on the sibling `core_lib` crate?',
        options: [
          'By adding `core_lib = "*"` to its `[dependencies]`',
          'By adding `core_lib = { path = "../core_lib" }` to its `[dependencies]`',
          'Sibling crates are available automatically — no declaration needed',
          'By importing it in `Cargo.toml` under `[workspace.members]`'
        ],
        answer: 1,
        explanation: 'Path dependencies use `path = "../sibling_name"` to reference crates within the same workspace. This avoids publishing to crates.io just to use a local sibling crate.'
      },
      {
        q: 'You run `cargo test` from inside the `cli_app/` directory of a workspace. What happens?',
        options: [
          'All workspace members are tested',
          'Only `cli_app` is tested; other members are ignored',
          'Cargo returns an error because you must always run from the workspace root',
          'The workspace root\'s `Cargo.toml` is automatically detected'
        ],
        answer: 1,
        explanation: 'Running Cargo commands from a member\'s subdirectory only affects that member. To run tests across all members, you must run from the workspace root directory.'
      },
      {
        q: 'What must the workspace root `Cargo.toml` contain?',
        options: [
          'A `[package]` section with a name and version',
          'A `[workspace]` section with a `members` list',
          'A `[lib]` section pointing to the main library',
          'A `[dependencies]` section listing all shared dependencies'
        ],
        answer: 1,
        explanation: 'The workspace root manifest must have a `[workspace]` section with a `members` array listing the paths to each member crate. It typically has no `[package]` section of its own.'
      },
      {
        q: 'Where do compiled artifacts for all workspace members get placed?',
        options: [
          'Each member has its own `target/` directory',
          'A single `target/` directory at the workspace root, shared by all members',
          'In the user\'s home directory under `.cargo/target/`',
          'In `/tmp/` for workspace builds'
        ],
        answer: 1,
        explanation: 'Workspaces share a single `target/` directory at the root. This is one of the key benefits: dependencies compiled for one member are reused by others, saving significant build time.'
      }
    ]
  },

  'ch57': {
    title: 'Chapter 57 Quiz: Library Design',
    questions: [
      {
        q: 'What is the purpose of a `pub mod prelude` in a library?',
        options: [
          'To make every item in the crate public',
          'To group the most commonly used items so users can import them all with `use my_lib::prelude::*`',
          'To document the library\'s API',
          'To declare the minimum required Rust version'
        ],
        answer: 1,
        explanation: 'A `prelude` module is a curated collection of the most frequently needed items from a library. Users import the entire prelude with a single `use my_lib::prelude::*` statement, similar to how Rust\'s own standard prelude works.'
      },
      {
        q: 'A struct field is declared without `pub`. What happens when external code tries to create that struct with a struct literal?',
        options: [
          'It works fine — field visibility does not affect construction',
          'The compiler produces an error because the private field cannot be set',
          'The field is automatically initialized to its default value',
          'The struct itself becomes private'
        ],
        answer: 1,
        explanation: 'If any field of a struct is private, external code cannot use a struct literal `MyStruct { field: value }` to construct it. You must provide a public constructor function (like `MyStruct::new()`).'
      },
      {
        q: 'What is a Cargo feature flag used for in library design?',
        options: [
          'To enable debug assertions in release builds',
          'To let users opt into optional functionality and dependencies without affecting those who don\'t need it',
          'To mark unstable API that may change',
          'To control which Rust edition the library compiles with'
        ],
        answer: 1,
        explanation: 'Feature flags allow conditional compilation. Users who need JSON support add `features = ["json"]`; those who don\'t are not burdened with the extra dependency. This keeps the default dependency footprint small.'
      },
      {
        q: 'Why is it a problem for a public function to return a private type?',
        options: [
          'Private types cause runtime panics when returned',
          'The compiler will reject it because external callers cannot name the return type',
          'It makes the function run slower',
          'It is not a problem — private types can always be returned from public functions'
        ],
        answer: 1,
        explanation: 'Returning a private type from a public function is a compiler error. External callers cannot name the type, so they cannot store the return value or call methods on it, making the function useless. The type must be made public or replaced by a public wrapper.'
      },
      {
        q: 'You want to expose a complex internal tree of modules as a flat API. Which technique achieves this?',
        options: [
          'Make every internal module and item `pub`',
          'Use `pub use` to re-export items at the desired public path',
          'Rename all modules to have single-character names',
          'Use a workspace to separate the internal and public APIs'
        ],
        answer: 1,
        explanation: '`pub use path::to::Item` re-exports the item at the location of the statement. By placing `pub use` in `lib.rs`, you bring deeply nested items to the crate\'s top-level path, giving users a clean API without exposing your internal structure.'
      }
    ]
  },

  'ch58': {
    title: 'Chapter 58 Quiz: Idiomatic Rust Patterns',
    questions: [
      {
        q: 'In the builder pattern, why does each setter method return `Self` instead of `()`?',
        options: [
          'To allow the compiler to check types more efficiently',
          'To enable method chaining, so multiple setters can be called in sequence on one expression',
          'Because `()` is not a valid return type in Rust',
          'To prevent the builder from being cloned'
        ],
        answer: 1,
        explanation: 'Returning `Self` from each setter allows callers to chain calls: `Builder::new().timeout(30).retry(3).build()`. Without `Self`, each setter call would need to be stored in a variable before the next call.'
      },
      {
        q: 'What problem does the newtype pattern solve?',
        options: [
          'It allows wrapping a type to make it implement additional traits, and creates a distinct type to prevent unit/semantic confusion',
          'It provides a way to create types at runtime without a struct declaration',
          'It reduces memory usage by sharing storage between types',
          'It automatically derives all standard traits for a type'
        ],
        answer: 0,
        explanation: 'The newtype pattern (a single-field tuple struct) creates a distinct type from its inner type, preventing accidental confusion (e.g., passing Miles where Kilometers is expected). It also lets you implement foreign traits on foreign types by wrapping them.'
      },
      {
        q: 'What is RAII in the context of Rust?',
        options: [
          'A macro that automatically implements the Drop trait',
          'The principle that resources are tied to object lifetimes: acquired at creation and released automatically when the object is dropped',
          'A compiler pass that optimizes memory allocation',
          'A pattern for sharing resources across threads safely'
        ],
        answer: 1,
        explanation: 'RAII (Resource Acquisition Is Initialization) means that resource cleanup (closing files, releasing locks) happens automatically when an object goes out of scope via Rust\'s `Drop` trait. You cannot forget to clean up because the compiler guarantees `drop` is called.'
      },
      {
        q: 'Given `#[derive(Default)] struct Config { debug: bool, workers: usize }`, what does `Config::default()` return?',
        options: [
          'A Config where all fields are None',
          'A Config where debug is false and workers is 0 (the zero values for their types)',
          'A compile error — Default can only be derived for enums',
          'A Config where debug is true and workers is 1'
        ],
        answer: 1,
        explanation: '`Default` for primitive types uses their natural zero value: `false` for `bool`, `0` for numeric types, `""` for `String`, etc. `#[derive(Default)]` generates this automatically for structs whose all fields also implement `Default`.'
      },
      {
        q: 'In the typestate pattern, why are different states represented as separate types rather than as enum variants?',
        options: [
          'Enums are not allowed in struct definitions',
          'Separate types allow the compiler to statically enforce that methods are only called in valid states at compile time, with zero runtime cost',
          'Enum variants cannot be used as generic type parameters',
          'It is purely a style preference with no functional difference'
        ],
        answer: 1,
        explanation: 'With the typestate pattern, calling a method on a wrong-state object is a compile-time error, not a runtime panic. An enum-based state machine would require runtime checks (`match state { ... }`) and could panic; separate types eliminate that entire class of bugs at zero cost.'
      }
    ]
  },

  'ch59': {
    title: 'Chapter 59 Quiz: Public API Design Principles',
    questions: [
      {
        q: 'Why should a function accept `&str` instead of `String` when it only needs to read the string?',
        options: [
          '`String` is slower to pass than `&str`',
          'Accepting `&str` is more flexible: callers with `String`, `&str`, or string literals all work without allocating',
          '`String` is not allowed as a function parameter type',
          'The compiler requires `&str` for all string parameters'
        ],
        answer: 1,
        explanation: 'A `String` parameter forces callers to produce an owned String, possibly allocating. A `&str` parameter accepts both `&String` (via auto-deref) and string literals, giving callers flexibility while keeping the function equally fast.'
      },
      {
        q: 'What does `#[non_exhaustive]` on a public enum tell downstream users?',
        options: [
          'The enum has no variants yet and is a placeholder',
          'The enum may gain new variants in future versions, so all match expressions must include a wildcard arm',
          'The enum cannot be used in match expressions',
          'All variants of the enum are private'
        ],
        answer: 1,
        explanation: '`#[non_exhaustive]` signals to callers in other crates that the enum is not complete. They must add a `_ => ...` wildcard arm to any `match`, allowing you to add new variants in minor releases without breaking existing users.'
      },
      {
        q: 'In semantic versioning (SemVer), when should you increment the MAJOR version number?',
        options: [
          'When you add a new function to the API',
          'When you fix a bug without changing the API',
          'When you make a breaking change that requires callers to update their code',
          'When you add a new optional feature flag'
        ],
        answer: 2,
        explanation: 'MAJOR version bumps (e.g., 1.0.0 to 2.0.0) signal breaking changes. MINOR bumps add backwards-compatible features. PATCH bumps fix bugs. This contract lets Cargo automatically select compatible upgrades for users.'
      },
      {
        q: 'A public function returns `Result<Data, String>`. What is a better return type for a library API and why?',
        options: [
          '`Result<Data, ()>` — simpler is always better',
          'A custom error enum — callers can match on specific error variants and handle each case programmatically',
          '`Option<Data>` — eliminates the need for error types entirely',
          'The current type is ideal — strings are the most flexible error representation'
        ],
        answer: 1,
        explanation: 'A custom error enum lets callers distinguish between error cases with a `match` expression and take different actions. A `String` error forces callers to parse text, which is fragile and prevents programmatic error handling.'
      },
      {
        q: 'You have `pub fn process(data: impl AsRef<str>)`. Which of the following can be passed to `process`?',
        options: [
          'Only `&str` values',
          'Only `String` values',
          'Both `&str` and `String`, plus any type implementing `AsRef<str>`',
          'Only values with a `\'static` lifetime'
        ],
        answer: 2,
        explanation: '`impl AsRef<str>` accepts any type that can produce a `&str` reference. Both `String` and `&str` implement `AsRef<str>`, as do types like `Cow<str>` and `PathBuf` (for paths). This is the most flexible way to accept string-like data.'
      }
    ]
  },

  'ch60': {
    title: 'Chapter 60 Quiz: Documentation & rustdoc',
    questions: [
      {
        q: 'What is the difference between `///` and `//!` doc comment styles?',
        options: [
          '`///` documents the next item; `//!` documents the enclosing item (typically used at the top of a file to document the module or crate)',
          '`///` is for functions only; `//!` is for structs only',
          '`///` generates HTML; `//!` generates plain text',
          'They are identical — both document the next item'
        ],
        answer: 0,
        explanation: '`///` is an outer doc comment placed before an item. `//!` is an inner doc comment placed inside an item (like at the top of a module file or `lib.rs`) and documents the item that contains it.'
      },
      {
        q: 'What happens to code blocks in `///` doc comments when you run `cargo test`?',
        options: [
          'They are ignored — only `#[test]` functions are run',
          'They are compiled and run as doc tests, failing the test suite if they panic or fail to compile',
          'They are displayed as output but not executed',
          'They are only run if you pass `--doc` to cargo test'
        ],
        answer: 1,
        explanation: 'Code blocks in doc comments (wrapped in triple backticks) are compiled and run as "doc tests" by `cargo test`. This ensures your examples stay correct as the code evolves.'
      },
      {
        q: 'Which `cargo` command generates HTML documentation and opens it in a browser?',
        options: [
          '`cargo doc --open`',
          '`cargo build --docs`',
          '`cargo generate-docs --view`',
          '`rustdoc --open src/lib.rs`'
        ],
        answer: 0,
        explanation: '`cargo doc --open` generates HTML documentation for your crate and its dependencies, then opens the result in your default browser. The output lands in `target/doc/<crate_name>/index.html`.'
      },
      {
        q: 'You want a code block in a doc comment to be shown as an example but NOT run as a test. Which annotation do you use?',
        options: [
          '```no_test',
          '```ignore',
          '```compile_fail',
          '```no_run'
        ],
        answer: 3,
        explanation: '````no_run` tells rustdoc to compile the example (catching syntax errors) but not execute it. This is useful for examples that have side effects (like writing files or starting servers). `ignore` skips both compilation and execution.'
      },
      {
        q: 'In a doc comment, `[`Vec`]` creates what?',
        options: [
          'A code literal that renders as monospace text',
          'An intra-doc link that links to the documentation page for `Vec`',
          'A footnote reference',
          'A module path import within the documentation'
        ],
        answer: 1,
        explanation: 'Rustdoc supports intra-doc links using `[`TypeName`]` or `[`module::item`]` syntax. These are resolved to actual links in the generated HTML, connecting your documentation to related items automatically.'
      }
    ]
  },

  'ch61': {
    title: 'Chapter 61 Quiz: Testing',
    questions: [
      {
        q: 'What does `#[cfg(test)]` on a module do?',
        options: [
          'It marks the module as containing integration tests only',
          'It ensures the module (and its contents) are only compiled when running `cargo test`, excluding it from production builds',
          'It automatically generates test functions for all public items in the module',
          'It disables optimizations inside the module for easier debugging'
        ],
        answer: 1,
        explanation: '`#[cfg(test)]` is a conditional compilation attribute. The module it annotates is only included in the build when Cargo is running tests. This keeps test-only code and test dependencies out of your production binary.'
      },
      {
        q: 'A test function is marked `#[should_panic(expected = "overflow")]`. When does this test PASS?',
        options: [
          'When the function completes without panicking',
          'When the function panics with a message containing the string "overflow"',
          'When the function panics for any reason, regardless of message',
          'When the function returns an Err value'
        ],
        answer: 1,
        explanation: '`#[should_panic(expected = "...")]` makes a test pass only if the code panics AND the panic message contains the expected substring. Without the `expected` parameter, any panic passes the test.'
      },
      {
        q: 'Where do integration tests live in a Cargo project, and what is special about them?',
        options: [
          'In `src/tests/` — they have access to private items just like unit tests',
          'In a `tests/` directory at the project root — each file is a separate test binary that only has access to the crate\'s public API',
          'In `src/lib.rs` in a `#[cfg(integration_test)]` module',
          'In `src/bin/` alongside other binaries'
        ],
        answer: 1,
        explanation: 'Integration tests live in `tests/` at the project root. Each file is compiled as a separate binary that imports your library as an external user would, with access only to public items. This tests your public API end-to-end.'
      },
      {
        q: 'What is the output when `assert_eq!(3 + 1, 5)` fails?',
        options: [
          'The test silently fails with no output',
          'The program prints "assertion failed" and continues running other tests',
          'The test panics and Cargo reports a failure showing both the left value (4) and right value (5)',
          'A compile error occurs because the assertion is statically evaluated'
        ],
        answer: 2,
        explanation: '`assert_eq!` panics on failure and includes both operand values in the panic message, making it easy to see what was expected vs what was actually returned. This is one reason to prefer `assert_eq!` over plain `assert!`.'
      },
      {
        q: 'A test function has signature `fn test_parse() -> Result<(), ParseIntError>`. The body uses `?` to propagate errors. How does Cargo determine if the test passed?',
        options: [
          'The test always passes because it returns Result instead of panicking',
          'The test passes if it returns `Ok(())` and fails if it returns `Err(...)`',
          'The `?` operator is not allowed in test functions',
          'Cargo only checks the exit code, not the return value'
        ],
        answer: 1,
        explanation: 'Test functions that return `Result<(), E>` pass when they return `Ok(())` and fail when they return `Err(...)`. This allows using the `?` operator inside tests, making error-path tests much cleaner than wrapping everything in `unwrap()`.'
      }
    ]
  },

});
