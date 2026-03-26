/* ================================================================
   Module 1: Rust Setup & First Programs
   Chapters: 1 - 4
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 1: Installing Rust (rustup, Toolchains)
     --------------------------------------------------------------- */
  'ch01': {
    moduleNum: 1,
    moduleTitle: 'Rust Setup & First Programs',
    chNum: 1,
    title: 'Installing Rust (rustup, Toolchains)',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 1 &mdash; Chapter 1</span>
</div>

<h1>Installing Rust (rustup, Toolchains)</h1>

<p>Before you write a single line of Rust, you need exactly one thing installed on your machine: <code>rustup</code>. It is the official <strong>toolchain manager for Rust</strong>, and it handles everything: the compiler, the standard library, the package manager, updates, and switching between versions. If you have used <code>nvm</code> for Node.js or <code>pyenv</code> for Python, rustup fills the same role, except it is the one that the Rust project itself builds and maintains.</p>

<p>You do not install Rust from your operating system's package manager. That route usually gives you an outdated version and no ability to switch between stable, beta, and nightly channels. Go through rustup instead.</p>

<h2>On Linux and macOS</h2>

<p>Open a terminal and run:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</code></pre>
</div>

<p>The installer will ask you to choose between default, custom, or cancel. Pick the default (option 1). It installs three things:</p>

<dl>
  <dt><code>rustc</code></dt>
  <dd>The Rust compiler. Takes your <code>.rs</code> files and turns them into executables.</dd>
  <dt><code>cargo</code></dt>
  <dd>The build tool and package manager. You will use this far more than calling <code>rustc</code> directly.</dd>
  <dt><code>rustup</code></dt>
  <dd>Stays on your system to manage updates and toolchain versions.</dd>
</dl>

<p>Once it finishes, restart your terminal (or run the command it suggests to update your PATH) and verify the install:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">rustc --version
cargo --version
rustup --version</code></pre>
</div>

<p>All three should print version numbers. If any of them says "command not found," your PATH was not updated. On most systems, rustup puts binaries in <code>~/.cargo/bin</code>. Make sure that directory is in your shell's PATH.</p>

<h2>On Windows</h2>

<p>Download <code>rustup-init.exe</code> from <a href="https://rustup.rs" target="_blank">https://rustup.rs</a> and run it. The process is the same: it installs <code>rustc</code>, <code>cargo</code>, and <code>rustup</code>. One catch: Rust on Windows needs the MSVC build tools (the C++ linker and Windows SDK). The installer will tell you if they are missing and point you to the Visual Studio Build Tools installer. You do not need the full Visual Studio IDE. Just install the "Desktop development with C++" workload. That is enough.</p>

<h2>What is a Toolchain?</h2>

<p>A toolchain is a specific version of the Rust compiler plus its associated tools. Rust ships on three channels:</p>

<dl>
  <dt><strong>stable</strong></dt>
  <dd>Released every six weeks. This is what you should use for all real work. Features land here only after they have been tested on beta and nightly.</dd>
  <dt><strong>beta</strong></dt>
  <dd>The next stable release, currently in its testing phase. You almost never need this unless you are testing compatibility ahead of a release.</dd>
  <dt><strong>nightly</strong></dt>
  <dd>The bleeding edge. Updated every night from the main development branch. Some experimental features (like certain unstable APIs or new syntax) are only available on nightly. You will not need this for a long time.</dd>
</dl>

<p>The default install gives you stable. To check which toolchain you are running:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">rustup show</code></pre>
</div>

<p>To update all installed toolchains to their latest versions:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">rustup update</code></pre>
</div>

<p>Run this every few weeks. Rust moves fast, and compiler updates often come with better error messages, faster compile times, and new features. There is almost never a reason to stay on an old version of stable.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>If you ever see a project that requires nightly, you can install it alongside stable without any conflicts: <code>rustup toolchain install nightly</code>. Then use <code>rustup override set nightly</code> in that project's directory. Everywhere else, stable stays the default.</p>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 2: Cargo Basics
     --------------------------------------------------------------- */
  'ch02': {
    moduleNum: 1,
    moduleTitle: 'Rust Setup & First Programs',
    chNum: 2,
    title: 'Cargo Basics',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 1 &mdash; Chapter 2</span>
</div>

<h1>Cargo Basics</h1>

<p>Cargo is the reason Rust projects do not descend into the dependency and build chaos you might have experienced in C or C++. It is a build system, a package manager, a test runner, a documentation generator, and a project scaffolder, all rolled into one binary. Every serious Rust project uses Cargo. Trying to work without it is like writing Java without Maven or Gradle: technically possible, practically miserable.</p>

<h2>Creating a New Project</h2>

<p>To start a new project:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo new my_project
cd my_project</code></pre>
</div>

<p>This creates a directory called <code>my_project</code> with the following inside:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">my_project/
├── Cargo.toml
└── src/
    └── main.rs</code></pre>
</div>

<p>It also initializes a Git repository automatically. If you do not want that, pass <code>--vcs none</code>.</p>

<p>If you want to create a library instead of an executable, use:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo new my_library --lib</code></pre>
</div>

<p>The difference: a binary project gets <code>src/main.rs</code> with a <code>main()</code> function. A library project gets <code>src/lib.rs</code> with a sample test. That is the only structural difference at the start.</p>

<h2>Building and Running</h2>

<p>The commands you will use every day:</p>

<dl>
  <dt><code>cargo build</code></dt>
  <dd>Compiles your project. The output goes into <code>target/debug/</code> by default. This is an unoptimized build meant for development.</dd>
  <dt><code>cargo run</code></dt>
  <dd>Compiles and immediately runs the resulting binary. This is what you will use 90% of the time during development. If the code has not changed since the last build, it skips recompilation.</dd>
  <dt><code>cargo build --release</code></dt>
  <dd>Compiles with optimizations turned on. The output goes into <code>target/release/</code>. Use this when you are benchmarking or shipping. Never benchmark a debug build: the performance difference is dramatic.</dd>
  <dt><code>cargo check</code></dt>
  <dd>Runs the compiler's analysis without producing an executable. This is significantly faster than a full build and is useful when you just want to see if your code compiles. Many Rust developers bind this to a keyboard shortcut in their editor.</dd>
</dl>

<h2>Adding Dependencies</h2>

<p>Rust's packages are called <strong>crates</strong>, and they live on <a href="https://crates.io" target="_blank">crates.io</a>, the official registry. To add a dependency, you edit <code>Cargo.toml</code>. Say you want to use the <code>rand</code> crate for random number generation:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[dependencies]
rand = "0.8"</code></pre>
</div>

<p>Then run <code>cargo build</code>. Cargo downloads the crate, compiles it, and links it into your project. The exact version it resolved gets recorded in <code>Cargo.lock</code>, which ensures that everyone on your team builds with the identical dependency tree. Commit <code>Cargo.lock</code> to version control for binary projects. For libraries, it is conventional to leave it out of version control.</p>

<p>You can also add dependencies from the command line:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo add rand</code></pre>
</div>

<p>This edits <code>Cargo.toml</code> for you. The <code>cargo add</code> command was stabilized in Rust 1.62 and is the quicker way to do it.</p>

<h2>Other Useful Commands</h2>

<dl>
  <dt><code>cargo test</code></dt>
  <dd>Runs all tests in your project (unit tests, integration tests, and doc tests).</dd>
  <dt><code>cargo doc --open</code></dt>
  <dd>Generates HTML documentation for your project and all its dependencies, then opens it in your browser.</dd>
  <dt><code>cargo fmt</code></dt>
  <dd>Formats your code according to the official Rust style. Requires the <code>rustfmt</code> component (installed by default). Run this before every commit. Do not argue about formatting.</dd>
  <dt><code>cargo clippy</code></dt>
  <dd>A linter that catches common mistakes and suggests more idiomatic Rust. Think of it as a stricter, smarter version of the compiler's own warnings. Install it with <code>rustup component add clippy</code> if it is not already there.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Get into the habit of running <code>cargo clippy</code> regularly. It will teach you idiomatic Rust faster than any tutorial. Many of its suggestions come with explanations of why the alternative is better.</p>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 3: Project Structure
     --------------------------------------------------------------- */
  'ch03': {
    moduleNum: 1,
    moduleTitle: 'Rust Setup & First Programs',
    chNum: 3,
    title: 'Project Structure',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 1 &mdash; Chapter 3</span>
</div>

<h1>Project Structure</h1>

<p>When you run <code>cargo new</code>, you get a minimal project. But as your code grows, you need to understand where things go and why Cargo expects them there. Rust does not force a deep hierarchy of config files on you. The conventions are simple, and if you follow them, Cargo handles everything automatically.</p>

<h2>Cargo.toml: The Manifest</h2>

<p>This is the single most important file in your project. It tells Cargo your project's name, version, which edition of Rust you are targeting, and what dependencies you need.</p>

<p>A typical <code>Cargo.toml</code> for a new binary project:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]</code></pre>
</div>

<p>The <strong>edition</strong> field deserves explanation. Rust uses editions (2015, 2018, 2021, and soon 2024) to introduce changes that might break old code. When you set <code>edition = "2021"</code>, you are telling the compiler to use the 2021 edition's rules. Critically, different crates in the same project can use different editions and still interoperate. An edition is not a language version; it is more like a dialect. Always use the latest edition for new projects.</p>

<h2>src/: Where Your Code Lives</h2>

<p>Cargo expects source code in the <code>src/</code> directory:</p>

<dl>
  <dt><code>src/main.rs</code></dt>
  <dd>The entry point for a binary (executable) project. This file must contain a <code>fn main()</code> function.</dd>
  <dt><code>src/lib.rs</code></dt>
  <dd>The root of a library crate. If your project is a library, this is where your public API starts.</dd>
</dl>

<p>You can have both. A project with both <code>src/main.rs</code> and <code>src/lib.rs</code> compiles as both a binary and a library. The binary can use the library internally. This is a common pattern for command-line tools that also expose a programmatic API.</p>

<h2>target/: Build Output</h2>

<p>The <code>target/</code> directory is where Cargo puts everything it compiles. You will see:</p>

<dl>
  <dt><code>target/debug/</code></dt>
  <dd>Unoptimized builds (from <code>cargo build</code> or <code>cargo run</code>).</dd>
  <dt><code>target/release/</code></dt>
  <dd>Optimized builds (from <code>cargo build --release</code>).</dd>
</dl>

<p>This directory gets large. It is already in the default <code>.gitignore</code> that Cargo generates. Never commit it. If it gets corrupted or bloated, delete it entirely. <code>cargo clean</code> does exactly that. Cargo will rebuild everything from scratch on the next build.</p>

<h2>A Growing Project</h2>

<p>As your project matures, you might end up with a structure like this:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">my_project/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── main.rs
│   ├── lib.rs
│   └── utils.rs
├── tests/
│   └── integration_test.rs
├── benches/
│   └── benchmark.rs
└── examples/
    └── demo.rs</code></pre>
</div>

<p>The <strong>tests/</strong> directory holds integration tests: tests that exercise your library from the outside, the same way a user of your crate would. The <strong>benches/</strong> directory is for benchmarks. The <strong>examples/</strong> directory holds standalone programs that demonstrate how to use your library.</p>

<p>You can run any example with <code>cargo run --example demo</code>. All of these directories are optional. Use them when you need them.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Do not overthink your project structure at the start. A single <code>main.rs</code> can hold a surprising amount of code. Split into modules when you start losing track of what lives where, not before.</p>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 4: Hello World
     --------------------------------------------------------------- */
  'ch04': {
    moduleNum: 1,
    moduleTitle: 'Rust Setup & First Programs',
    chNum: 4,
    title: 'Hello World',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 1 &mdash; Chapter 4</span>
</div>

<h1>Hello World</h1>

<p>This is the chapter where you actually write code, compile it, and watch it run. We are going to do this two ways: first by calling the compiler directly so you can see what is happening under the hood, then with Cargo, which is how you will do it for every project going forward.</p>

<h2>The Hard Way: Using rustc Directly</h2>

<p>Create a file called <code>main.rs</code> anywhere on your system. Open it in whatever editor you like and type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    println!("Hello, world!");
}</code></pre>
</div>

<p>Save the file. Now open your terminal, navigate to the directory where you saved it, and compile:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">rustc main.rs</code></pre>
</div>

<p>If there are no errors, this produces an executable in the same directory. On Linux and macOS it is called <code>main</code>. On Windows it is <code>main.exe</code>. Run it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># Linux / macOS
./main

# Windows
.\main.exe</code></pre>
</div>

<p>You should see:</p>

<pre class="output"><code>Hello, world!</code></pre>

<p>That is it. You just compiled and ran your first Rust program.</p>

<h2>What Just Happened?</h2>

<p>Let us break down those three lines. <code>fn main()</code> declares a function called <code>main</code>. Every Rust binary starts execution here. Unlike C, there is no return type declaration when <code>main</code> returns nothing. The absence of a return type means it returns the unit type <code>()</code>, which you can think of as "void" for now.</p>

<p><code>println!</code> is not a function. Notice the exclamation mark. It is a macro. Macros in Rust are a separate system from functions and they can do things functions cannot, like accept a variable number of arguments. You will learn about macros much later in the course. For now, just know that <code>println!</code> prints a line to standard output and that the <code>!</code> tells you it is a macro.</p>

<p>The string <code>"Hello, world!"</code> is a string literal. Rust strings are UTF-8 encoded by default. The semicolon at the end terminates the statement. Rust requires semicolons. This is not JavaScript where they are optional.</p>

<h2>The Right Way: Using Cargo</h2>

<p>You will never call <code>rustc</code> manually for a real project. Cargo handles compilation, dependency resolution, and much more. Here is how to do the same thing with Cargo:</p>

<p><strong>Step 1:</strong> Create a new project:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo new hello_rust
cd hello_rust</code></pre>
</div>

<p><strong>Step 2:</strong> Open <code>src/main.rs</code>. Cargo has already generated it for you, and it contains:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    println!("Hello, world!");
}</code></pre>
</div>

<p>Cargo gives you a Hello World by default. You do not even need to edit anything.</p>

<p><strong>Step 3:</strong> Build and run:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo run</code></pre>
</div>

<p>You will see output that looks like this:</p>

<pre class="output"><code>   Compiling hello_rust v0.1.0 (/home/you/hello_rust)
    Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 0.42s
     Running \`target/debug/hello_rust\`
Hello, world!</code></pre>

<p>The first three lines are Cargo telling you what it did: it compiled in debug mode (unoptimized, with debug symbols) and then immediately ran the binary. The fourth line is your program's actual output.</p>

<p>Run <code>cargo run</code> again without changing anything. This time it skips the "Compiling" step and goes straight to running. Cargo knows nothing changed, so it does not waste time recompiling. This is incremental compilation at work, and it is one of the reasons Cargo is pleasant to use.</p>

<h2>Try Modifying It</h2>

<p>Change <code>src/main.rs</code> to something slightly more interesting:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let name = "Rust";
    let year = 2015;
    println!("{} has been stable since {}.", name, year);
}</code></pre>
</div>

<p>Run it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo run</code></pre>
</div>

<p>Output:</p>

<pre class="output"><code>Rust has been stable since 2015.</code></pre>

<p>Here you used <code>let</code> to bind values to names (Rust calls them bindings, not variables; you will see why when we talk about mutability in Module 2). The <code>{}</code> inside the string is a placeholder that <code>println!</code> fills in order from the arguments after the format string. This works like Python's <code>{}</code> in format strings or C's <code>%s</code> and <code>%d</code> in printf, except Rust's version is type-safe and checked at compile time.</p>

<h2>What If Something Goes Wrong?</h2>

<p>Try introducing an error deliberately. Change the code to:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    println!("The answer is {}", 40 + "2");
}</code></pre>
</div>

<p>Run <code>cargo run</code>. You will get something like:</p>

<pre class="output"><code>error[E0277]: cannot add \`&str\` to \`{integer}\`
 --> src/main.rs:2:40
  |
2 |     println!("The answer is {}", 40 + "2");
  |                                        ^ no implementation for
  |                                          \`{integer} + &str\`</code></pre>

<p>This is one of the things Rust is famous for: its compiler errors are genuinely helpful. It tells you the exact file, the exact line, the exact character where the problem is, and what went wrong. In this case, you tried to add a string to a number, and Rust does not silently coerce types. Read the compiler errors carefully. They are not obstacles; they are the compiler trying to help you. Get comfortable with them. You will see many of them as you learn, and they will almost always tell you how to fix the problem.</p>

<h2>Complete Step-by-Step Summary</h2>

<p>Here is everything, from zero to running code, in one block:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># 1. Install Rust (if you have not already)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Restart your terminal, then verify
rustc --version
cargo --version

# 3. Create a new project
cargo new hello_rust
cd hello_rust

# 4. Build and run
cargo run

# 5. You should see:
# Hello, world!</code></pre>
</div>

<p>Five steps. That is all it takes to go from nothing to running Rust on your machine. If you got this far, you are set up and ready. Everything from here builds on this foundation.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Keep this project around. As you work through the next modules, you can use it as a scratch pad to test small ideas before you start building anything larger.</p>
</div>
`
  },

});
