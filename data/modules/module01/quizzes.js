/* ================================================================
   Module 1 Quizzes — 5 questions per chapter
   ================================================================ */
Object.assign(QUIZZES, {

  'ch01': {
    title: 'Chapter 1 Quiz: Installing Rust',
    questions: [
      {
        q: 'What is the official Rust toolchain manager that handles the compiler, standard library, and version switching?',
        options: ['rustc', 'cargo', 'rustup', 'rustdoc'],
        answer: 2,
        explanation: 'rustup is the official toolchain manager for Rust. rustc is the compiler, cargo is the build tool, and rustdoc generates documentation.'
      },
      {
        q: 'Which command verifies that rustc, cargo, and rustup are all correctly installed?',
        options: [
          'rust --check',
          'rustup verify',
          'rustc --version, cargo --version, and rustup --version',
          'cargo verify --all'
        ],
        answer: 2,
        explanation: 'Running rustc --version, cargo --version, and rustup --version individually confirms each tool is installed and on the PATH.'
      },
      {
        q: 'Which Rust release channel is recommended for all production and real-world work?',
        options: ['nightly', 'beta', 'stable', 'release'],
        answer: 2,
        explanation: 'The stable channel is released every six weeks. Features land here only after passing through nightly and beta. It is the correct default for all real projects.'
      },
      {
        q: 'Which command updates all installed Rust toolchains to their latest versions?',
        options: ['rustup upgrade', 'rustup update', 'cargo update', 'rustup sync'],
        answer: 1,
        explanation: 'rustup update fetches and installs the latest releases for every toolchain you have installed. Run it every few weeks to stay current.'
      },
      {
        q: 'On Windows, what additional requirement does Rust need beyond rustup itself?',
        options: [
          'MinGW (Minimalist GNU for Windows)',
          'Cygwin',
          'MSVC build tools with the "Desktop development with C++" workload',
          'The full Visual Studio IDE'
        ],
        answer: 2,
        explanation: 'Rust on Windows requires the MSVC build tools for the C++ linker and Windows SDK. You only need the "Desktop development with C++" workload from Visual Studio Build Tools, not the full IDE.'
      }
    ]
  },

  'ch02': {
    title: 'Chapter 2 Quiz: Cargo Basics',
    questions: [
      {
        q: 'Which command compiles a Rust project with all optimizations enabled, suitable for benchmarking and shipping?',
        options: [
          'cargo run --release',
          'cargo build --release',
          'cargo compile --opt',
          'rustc --release'
        ],
        answer: 1,
        explanation: 'cargo build --release compiles with optimizations. The output goes to target/release/. Never benchmark a debug build as the performance difference is dramatic.'
      },
      {
        q: 'What is the purpose of Cargo.lock?',
        options: [
          'Prevents other developers from editing Cargo.toml',
          'Records the exact resolved dependency versions so builds are reproducible',
          'Locks the Rust edition to prevent accidental upgrades',
          'Prevents cargo update from running automatically'
        ],
        answer: 1,
        explanation: 'Cargo.lock records the precise version of every dependency that was resolved. This ensures everyone on the team builds with the identical dependency tree.'
      },
      {
        q: 'Which command runs a linter that catches common mistakes and suggests more idiomatic Rust code?',
        options: ['cargo lint', 'cargo fmt', 'cargo clippy', 'cargo check'],
        answer: 2,
        explanation: 'cargo clippy is a linter that catches common mistakes and suggests idiomatic Rust. cargo fmt formats code. cargo check only type-checks without producing a binary.'
      },
      {
        q: 'Where do Rust packages (crates) live by default?',
        options: ['npmjs.com', 'crates.io', 'pkg.rust-lang.org', 'github.com/rust-lang'],
        answer: 1,
        explanation: 'crates.io is the official Rust package registry. You can browse crates there and add them as dependencies in Cargo.toml.'
      },
      {
        q: 'Which Rust version stabilized the cargo add command for adding dependencies from the command line?',
        options: ['Rust 1.56', 'Rust 1.60', 'Rust 1.62', 'Rust 1.70'],
        answer: 2,
        explanation: 'cargo add was stabilized in Rust 1.62. Before that, developers had to manually edit Cargo.toml to add dependencies.'
      }
    ]
  },

  'ch03': {
    title: 'Chapter 3 Quiz: Project Structure',
    questions: [
      {
        q: 'What is the single most important file in a Cargo project, containing the project name, version, edition, and dependencies?',
        options: ['src/main.rs', 'Cargo.lock', 'Cargo.toml', 'src/lib.rs'],
        answer: 2,
        explanation: 'Cargo.toml is the project manifest. It defines everything Cargo needs to know about your project including its name, version, edition, and all dependencies.'
      },
      {
        q: 'What does the edition field in Cargo.toml specify?',
        options: [
          'The version of Rust to install',
          'The project\'s own semantic version number',
          'Which set of Rust language rules (dialect) the compiler should use',
          'The minimum supported Rust version for users of your library'
        ],
        answer: 2,
        explanation: 'The edition field (e.g., edition = "2021") tells the compiler which language rules to apply. An edition is more like a dialect than a version. Different crates in the same project can use different editions and still interoperate.'
      },
      {
        q: 'Which directory holds integration tests that exercise your library the same way an external user would?',
        options: ['src/tests/', 'test/', 'tests/', 'spec/'],
        answer: 2,
        explanation: 'The tests/ directory at the project root holds integration tests. These tests can only access the public API of your library, just like an external user.'
      },
      {
        q: 'Which command removes all compiled output in the target/ directory?',
        options: ['cargo reset', 'cargo clean', 'cargo purge', 'cargo clear'],
        answer: 1,
        explanation: 'cargo clean deletes the entire target/ directory. Cargo will rebuild everything from scratch on the next build. The target/ directory should never be committed to version control.'
      },
      {
        q: 'Can a single Cargo project have both src/main.rs and src/lib.rs?',
        options: [
          'No, you must choose either binary or library at creation',
          'Yes, it compiles as both a binary and a library, and the binary can use the library internally',
          'Yes, but only when using Cargo workspaces',
          'No, it causes a compilation error'
        ],
        answer: 1,
        explanation: 'A project with both src/main.rs and src/lib.rs is compiled as both a binary and a library. This is a common pattern for command-line tools that also expose a programmatic API.'
      }
    ]
  },

  'ch04': {
    title: 'Chapter 4 Quiz: Hello World',
    questions: [
      {
        q: 'What is println! in Rust, and what does the ! indicate?',
        options: [
          'A built-in function; ! means it is unsafe',
          'A macro; ! distinguishes macros from regular functions',
          'A method on the standard output stream; ! means it flushes the buffer',
          'A compiler directive; ! means it runs at compile time'
        ],
        answer: 1,
        explanation: 'println! is a macro, not a function. The ! is Rust syntax for macro invocations, distinguishing them from regular function calls. Macros can accept a variable number of arguments, which is why println! can handle any number of format arguments.'
      },
      {
        q: 'What encoding do Rust string literals use by default?',
        options: ['ASCII', 'UTF-16', 'UTF-8', 'Latin-1 (ISO 8859-1)'],
        answer: 2,
        explanation: 'Rust strings are UTF-8 encoded by default. This applies to string literals (&str) and owned Strings alike. Rust enforces valid UTF-8 at the type level.'
      },
      {
        q: 'What is the entry point function required for every Rust binary?',
        options: ['fn start()', 'pub fn main()', 'fn main()', 'fn run()'],
        answer: 2,
        explanation: 'Every Rust binary must have fn main(). The pub visibility modifier is not required. Unlike C, when main returns nothing, there is no explicit return type; Rust infers the unit type ().'
      },
      {
        q: 'When you run cargo run a second time without changing any code, what does Cargo skip and why?',
        options: [
          'It skips linking because linking is cached',
          'It skips everything and uses the cached output binary directly',
          'It skips recompilation because of incremental compilation',
          'It skips dependency resolution to save network requests'
        ],
        answer: 2,
        explanation: 'Cargo uses incremental compilation. If the source code has not changed since the last build, Cargo detects this and skips recompilation, going straight to running the existing binary.'
      },
      {
        q: 'In println!("{} has been stable since {}.", name, year), what do the {} placeholders represent?',
        options: [
          'Type annotations that must match the argument types',
          'Positions filled in order by the arguments following the format string',
          'String escape sequences similar to \\n',
          'Block expressions that are evaluated inline'
        ],
        answer: 1,
        explanation: '{} in a Rust format string is a placeholder. println! fills each {} in order from the arguments listed after the format string. Unlike C\'s printf, Rust\'s format strings are type-safe and checked at compile time.'
      }
    ]
  }

});
