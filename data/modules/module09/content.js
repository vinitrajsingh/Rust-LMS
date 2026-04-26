Object.assign(CHAPTERS_CONTENT, {

  /* =========================================================
     ch54 — Modules & Visibility
  ========================================================= */
  'ch54': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 54,
    title: 'Modules & Visibility',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 54</span>
</div>
<h1>Modules &amp; Visibility</h1>

<p>Imagine a large office building. Every floor has rooms, and every room has filing cabinets. Visitors from outside can only enter through the front desk. Employees on the same floor can visit each other freely. People on different floors need a keycard. Rust's module system works exactly like this building: it lets you control who can see what, floor by floor, room by room.</p>

<h2>What Is a Module?</h2>

<p>A <strong>module</strong> groups related code under a name. You declare one with the <code>mod</code> keyword. By default, everything inside a module is <em>private</em>, invisible to code outside it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">mod greetings {
    // Private by default — only visible inside this module
    fn secret_hello() {
        println!("psst... hello");
    }

    // pub makes this visible to everyone outside
    pub fn hello() {
        println!("Hello, world!");
    }
}

fn main() {
    greetings::hello();          // OK — hello is pub
    // greetings::secret_hello(); // ERROR — secret_hello is private
}</code></pre>
</div>

<p>The double colon <code>::</code> is the path separator in Rust, like a folder slash in a file system.</p>

<h2>Nested Modules</h2>

<p>Modules can live inside other modules, forming a tree — just like folders inside folders.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">mod restaurant {
    // The outer module can contain inner modules
    pub mod front_of_house {
        pub mod hosting {
            pub fn add_to_waitlist() {
                println!("Added to waitlist");
            }
        }
    }

    // Private inner module — customers cannot see the kitchen
    mod back_of_house {
        pub fn cook_order() {
            println!("Cooking your order...");
        }
    }

    // A function inside restaurant can access both sub-modules
    pub fn serve() {
        back_of_house::cook_order();
        println!("Order served!");
    }
}

fn main() {
    // Access nested public module via full path
    restaurant::front_of_house::hosting::add_to_waitlist();
    restaurant::serve();
    // restaurant::back_of_house::cook_order(); // ERROR — private
}</code></pre>
</div>

<h2>The <code>use</code> Keyword — Shortcuts for Paths</h2>

<p>Typing long paths repeatedly is tedious. <code>use</code> brings a path into scope so you can use a short name instead, like creating an alias.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">mod geometry {
    pub mod shapes {
        pub fn draw_circle() { println!("Drawing circle"); }
        pub fn draw_square() { println!("Drawing square"); }
    }
}

// Bring the shapes module into scope
use geometry::shapes;

// OR bring specific items directly
use geometry::shapes::draw_circle;

fn main() {
    shapes::draw_square();   // short path via use
    draw_circle();           // even shorter — function brought directly
}</code></pre>
</div>

<p>You can import multiple items from the same path using curly braces:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Instead of three separate use lines:
// use std::collections::HashMap;
// use std::collections::HashSet;
// use std::collections::BTreeMap;

// Combine them:
use std::collections::{HashMap, HashSet, BTreeMap};

fn main() {
    let mut map: HashMap&lt;&str, i32&gt; = HashMap::new();
    map.insert("apples", 3);
    println!("{:?}", map);
}</code></pre>
</div>

<h2>Visibility Modifiers</h2>

<p>Rust has several levels of visibility, giving you precise control:</p>

<dl>
  <dt><code>pub</code></dt>
  <dd>Visible to everyone, including users of your library.</dd>
  <dt><code>pub(crate)</code></dt>
  <dd>Visible anywhere within the same crate, but not to outside users.</dd>
  <dt><code>pub(super)</code></dt>
  <dd>Visible to the parent module only.</dd>
  <dt>(no keyword)</dt>
  <dd>Private. Visible only within the current module and its descendants.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">mod outer {
    // Only the parent (outer) can see this
    pub(super) fn semi_private() {
        println!("Only outer and its parent can call me");
    }

    // Visible anywhere in the same crate
    pub(crate) fn crate_wide() {
        println!("Visible to all code in this crate");
    }

    pub mod inner {
        pub fn public_fn() {
            // inner can call its parent's pub(super) function
            super::semi_private(); // OK — super is outer
            super::crate_wide();   // OK — same crate
        }
    }
}

fn main() {
    outer::inner::public_fn();  // triggers both calls
    outer::crate_wide();        // OK — we are in the same crate
    // outer::semi_private();   // ERROR — we are not outer's parent
}</code></pre>
</div>

<h2>Splitting Modules Across Files</h2>

<p>As your code grows, putting all modules in one file becomes unwieldy. Rust lets you put a module in its own file. If you write <code>mod greetings;</code> (with a semicolon, not a block), Rust looks for <code>greetings.rs</code> or <code>greetings/mod.rs</code> automatically.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">src/
  main.rs
  greetings.rs     &lt;-- Rust loads this when it sees \`mod greetings;\`</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/main.rs
mod greetings;   // Rust finds src/greetings.rs automatically

fn main() {
    greetings::hello();
}

// src/greetings.rs  (separate file — no mod block needed here)
pub fn hello() {
    println!("Hello from greetings module!");
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The new style (Rust 2018 and later) uses <code>greetings.rs</code> for a module file. The older style used <code>greetings/mod.rs</code>. Both work, but prefer the flat <code>.rs</code> style for new projects.</p>
</div>

<h2>Re-exporting with <code>pub use</code></h2>

<p>Sometimes your internal module structure is deep, but you want users to access things from a simple top-level path. <code>pub use</code> re-exports an item, moving it to a different path.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">mod internals {
    pub mod deeply {
        pub mod nested {
            pub struct Config {
                pub value: i32,
            }
        }
    }
}

// Re-export Config at the top level so users don't need deep paths
pub use internals::deeply::nested::Config;

fn main() {
    // User writes this — clean and simple
    let cfg = Config { value: 42 };
    println!("{}", cfg.value);

    // Without re-export they would need to write:
    // internals::deeply::nested::Config { value: 42 }
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Forgetting <code>pub</code> on a struct field</div>
  <p>Making a struct public does NOT automatically make its fields public.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
mod shapes {
    pub struct Circle {
        radius: f64,  // private field!
    }
}
fn main() {
    let c = shapes::Circle { radius: 5.0 }; // ERROR: field is private
}

// FIXED
mod shapes {
    pub struct Circle {
        pub radius: f64,  // now public
    }
}
fn main() {
    let c = shapes::Circle { radius: 5.0 }; // OK
    println!("{}", c.radius);
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Mistake 2: Using <code>use</code> in the wrong scope</div>
  <p><code>use</code> only applies in the scope where it is written, not globally.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN — use inside one function is not visible in another
fn setup() {
    use std::collections::HashMap;
    let mut m: HashMap&lt;i32, i32&gt; = HashMap::new();
}
fn run() {
    let m: HashMap&lt;i32, i32&gt; = HashMap::new(); // ERROR: HashMap not in scope here
}

// FIXED — put use at the top of the file (module scope)
use std::collections::HashMap;

fn setup() { let mut m: HashMap&lt;i32, i32&gt; = HashMap::new(); }
fn run()   { let m: HashMap&lt;i32, i32&gt;  = HashMap::new(); }  // OK</code></pre>
</div>
`
  },

  /* =========================================================
     ch55 — Crate Architecture
  ========================================================= */
  'ch55': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 55,
    title: 'Crate Architecture',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 55</span>
</div>
<h1>Crate Architecture</h1>

<p>A crate is Rust's unit of compilation and the smallest thing you can publish to a package registry. Think of a crate like a standalone book: a book can contain many chapters (modules), but it is still one self-contained object you hand to someone. Two very different kinds of books exist: textbooks (libraries, meant to be read and used by others) and instruction manuals (binaries, meant to be followed directly by a machine).</p>

<h2>Binary Crates vs Library Crates</h2>

<p>Every Cargo project is one of two types, or both at once:</p>

<dl>
  <dt>Binary crate</dt>
  <dd>Produces an executable program. Must have a <code>main</code> function. Entry file: <code>src/main.rs</code>.</dd>
  <dt>Library crate</dt>
  <dd>Produces code for other crates to use. No <code>main</code> function. Entry file: <code>src/lib.rs</code>.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># Create a binary crate (default)
cargo new my_app

# Create a library crate
cargo new my_lib --lib

# A project can have BOTH:
# src/main.rs  -- binary
# src/lib.rs   -- library (imported by main.rs and by other crates)</code></pre>
</div>

<h2>Anatomy of <code>Cargo.toml</code></h2>

<p><code>Cargo.toml</code> is the manifest file that describes your crate, like a book's title page listing its name, edition, and author.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[package]
name    = "my_lib"     # crate name (used in \`use my_lib::...\`)
version = "0.1.0"      # follows semantic versioning: MAJOR.MINOR.PATCH
edition = "2021"       # Rust edition — always use 2021 for new projects

[dependencies]
# External crates your code depends on
serde = { version = "1", features = ["derive"] }
rand  = "0.8"

[dev-dependencies]
# Only used in tests — not compiled into your library
pretty_assertions = "1"</code></pre>
</div>

<h2>The Crate Root</h2>

<p>The <strong>crate root</strong> is the file Rust starts compiling from. For a binary it is <code>src/main.rs</code>; for a library it is <code>src/lib.rs</code>. Everything else is reached through <code>mod</code> declarations from this root.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">my_lib/
  Cargo.toml
  src/
    lib.rs         &lt;-- crate root for the library
    parser.rs      &lt;-- reached via \`mod parser;\` in lib.rs
    parser/
      helpers.rs   &lt;-- reached via \`mod helpers;\` inside parser.rs</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/lib.rs — the crate root
pub mod parser;          // Rust loads src/parser.rs
pub use parser::parse;   // Re-export so users can write my_lib::parse(...)

// src/parser.rs
mod helpers;             // Rust loads src/parser/helpers.rs

pub fn parse(input: &amp;str) -&gt; Vec&lt;String&gt; {
    helpers::tokenize(input)
}

// src/parser/helpers.rs
pub fn tokenize(input: &amp;str) -&gt; Vec&lt;String&gt; {
    input.split_whitespace()
         .map(|s| s.to_string())
         .collect()
}</code></pre>
</div>

<h2>A Project with Both Binary and Library</h2>

<p>This is a common real-world pattern: keep logic in the library (<code>lib.rs</code>) and keep the CLI thin in <code>main.rs</code>. This makes the logic testable without running the binary.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/lib.rs — the reusable logic
pub fn add(a: i32, b: i32) -&gt; i32 {
    a + b
}

// src/main.rs — the thin binary that uses the library
// The library is available under the package name
use my_lib::add;

fn main() {
    println!("{}", add(2, 3)); // prints 5
}</code></pre>
</div>

<h2>Multiple Binary Targets</h2>

<p>A single Cargo package can produce several executables by placing files in <code>src/bin/</code>. Each file becomes its own binary.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">src/
  lib.rs
  bin/
    server.rs    &lt;-- \`cargo run --bin server\`
    client.rs    &lt;-- \`cargo run --bin client\`</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo run --bin server   # runs src/bin/server.rs
cargo run --bin client   # runs src/bin/client.rs
cargo build --all-bins   # builds every binary in one go</code></pre>
</div>

<h2>The Rust Standard Library and Preludes</h2>

<p>The standard library (<code>std</code>) is a crate that ships with every Rust installation. A small set of its items (like <code>Vec</code>, <code>String</code>, <code>Option</code>, <code>Result</code>, <code>println!</code>) are automatically imported into every file via the <strong>prelude</strong>. You never need to write <code>use std::vec::Vec;</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// These are all available without any \`use\` statement
fn main() {
    let v: Vec&lt;i32&gt; = Vec::new();      // Vec from std prelude
    let s: String = String::from("hi");// String from std prelude
    let r: Result&lt;i32, &amp;str&gt; = Ok(1); // Result from std prelude
    println!("{:?} {:?}", v, r);
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Mixing up the crate root</div>
  <p>Declaring <code>mod foo;</code> in a file other than the crate root without following the correct path tree causes "file not found" errors.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN layout
// src/lib.rs has:  mod utils;
// src/parser.rs also has: mod utils;
// Rust looks for src/parser/utils.rs, NOT src/utils.rs
// This surprises many beginners

// FIXED — understand that mod looks relative to the CURRENT file's location
// In src/lib.rs:   mod parser;  -- loads src/parser.rs
// In src/parser.rs: mod utils;  -- loads src/parser/utils.rs (NOT src/utils.rs)</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Mistake 2: Forgetting to add a dependency to Cargo.toml</div>
  <p>Writing <code>use serde::Serialize;</code> without adding <code>serde</code> to <code>[dependencies]</code> gives a confusing "unresolved import" error.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># FIXED: add the crate to Cargo.toml first
[dependencies]
serde = { version = "1", features = ["derive"] }</code></pre>
</div>
`
  },

  /* =========================================================
     ch56 — Workspaces
  ========================================================= */
  'ch56': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 56,
    title: 'Workspaces',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 56</span>
</div>
<h1>Workspaces</h1>

<p>Think of a university campus. It has many separate departments, each doing its own research, but they share the same library, cafeteria, and HR system. A Cargo <strong>workspace</strong> is exactly this: one root folder containing multiple crates that share a single build output folder and a single <code>Cargo.lock</code> file. Each crate has its own <code>Cargo.toml</code>, but they cooperate under the workspace roof.</p>

<h2>Why Use a Workspace?</h2>

<p>Without workspaces you would have completely separate projects that cannot easily share code or coordinate versions. Workspaces solve three real problems:</p>

<ul>
  <li><strong>Shared compilation cache:</strong> Compiling common dependencies once saves time.</li>
  <li><strong>Consistent versions:</strong> One <code>Cargo.lock</code> means all crates agree on exactly which version of every dependency to use.</li>
  <li><strong>Easy cross-crate refactoring:</strong> You can change the library and test the binary in one <code>cargo build</code> command.</li>
</ul>

<h2>Creating a Workspace</h2>

<p>A workspace is just a root folder with a <code>Cargo.toml</code> that lists member crates. The root itself usually has no <code>src/</code> folder.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">my_workspace/
  Cargo.toml          &lt;-- workspace manifest (no [package] section)
  Cargo.lock          &lt;-- shared lock file (auto-generated)
  core_lib/
    Cargo.toml        &lt;-- member crate 1
    src/lib.rs
  cli_app/
    Cargo.toml        &lt;-- member crate 2
    src/main.rs
  api_server/
    Cargo.toml        &lt;-- member crate 3
    src/main.rs</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># my_workspace/Cargo.toml — the workspace root
[workspace]
members = [
    "core_lib",
    "cli_app",
    "api_server",
]

# Optional: specify a shared Rust edition for all members
resolver = "2"</code></pre>
</div>

<h2>Member Crate Manifests</h2>

<p>Each member has its own <code>Cargo.toml</code> that looks like any normal crate manifest. The only difference is they can reference sibling crates using a <em>path dependency</em>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># cli_app/Cargo.toml
[package]
name    = "cli_app"
version = "0.1.0"
edition = "2021"

[dependencies]
# Reference sibling crate by path — no version needed
core_lib = { path = "../core_lib" }
# External crate from crates.io
clap = "4"</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// core_lib/src/lib.rs
pub fn greet(name: &amp;str) -&gt; String {
    format!("Hello, {}!", name)
}

// cli_app/src/main.rs
use core_lib::greet;  // use the sibling library crate

fn main() {
    // This works because cli_app declares core_lib as a path dependency
    println!("{}", greet("workspace"));
}</code></pre>
</div>

<h2>Running Workspace Commands</h2>

<p>Cargo commands run from the workspace root affect all members by default, or you can target one with <code>-p</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># From the workspace root directory:

cargo build              # build ALL members
cargo test               # test ALL members
cargo build -p cli_app   # build only cli_app
cargo test  -p core_lib  # test only core_lib
cargo run   -p cli_app   # run the cli_app binary

# Check for errors across all members quickly
cargo check</code></pre>
</div>

<h2>Sharing Dependencies Across Members</h2>

<p>If multiple members use the same external crate, they all get the same version (locked in <code>Cargo.lock</code>). You can also define shared dependency versions at the workspace level to avoid repeating them.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># my_workspace/Cargo.toml — define versions once
[workspace]
members = ["core_lib", "cli_app"]

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

# ---
# core_lib/Cargo.toml — inherit the version from workspace
[dependencies]
serde.workspace = true   # uses the version declared above

# cli_app/Cargo.toml — same pattern
[dependencies]
tokio.workspace = true</code></pre>
</div>

<h2>Shared Output Directory</h2>

<p>All compiled artifacts for all workspace members land in one <code>target/</code> directory at the workspace root. This means shared build caches: if both <code>cli_app</code> and <code>api_server</code> depend on <code>serde</code>, it is only compiled once.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">my_workspace/
  target/                  &lt;-- shared by all members
    debug/
      cli_app              &lt;-- compiled binary
      api_server           &lt;-- compiled binary
      libcore_lib.rlib     &lt;-- compiled library
    release/
      ...</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Forgetting to list a crate in members</div>
  <p>If you create a new sub-crate but forget to add it to the workspace <code>members</code> list, <code>cargo build</code> will silently ignore it. Always update the root <code>Cargo.toml</code>.</p>
</div>

<div class="callout">
  <div class="callout-label">Mistake 2: Running cargo from a member directory</div>
  <p>Running <code>cargo test</code> from inside <code>cli_app/</code> only tests that one crate. Run from the workspace root to cover all members.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># WRONG — only tests cli_app, misses other members
cd cli_app && cargo test

# CORRECT — tests every member from workspace root
cd ..        # go back to workspace root
cargo test</code></pre>
</div>
`
  },

  /* =========================================================
     ch57 — Library Design
  ========================================================= */
  'ch57': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 57,
    title: 'Library Design',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 57</span>
</div>
<h1>Library Design</h1>

<p>Designing a library is like designing a kitchen appliance. The internal wiring and motor should be hidden; only the buttons and dials the user needs should be exposed. A well-designed library hides its messy internals and presents a clean, intuitive surface that is hard to misuse.</p>

<h2>The <code>lib.rs</code> as a Facade</h2>

<p>Think of <code>src/lib.rs</code> as the reception desk of your library. Internally you may have dozens of sub-modules, but you control exactly what visitors (users of your crate) can see by choosing what to make <code>pub</code> and what to re-export.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/lib.rs — the public face of the library

// Internal implementation details — private to the library
mod internal_parser;
mod internal_validator;

// Only expose what users need
pub mod config;           // whole sub-module is public
pub use internal_parser::parse;       // re-export one function
pub use internal_validator::validate; // re-export another

// Users of this crate can write:
//   use my_lib::parse;
//   use my_lib::validate;
//   use my_lib::config::Config;
// They cannot reach internal_parser or internal_validator directly.</code></pre>
</div>

<h2>Designing a Clean Public API</h2>

<p>Here is a concrete example: a small string-processing library that sanitizes user input.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/lib.rs
pub mod sanitizer;

// src/sanitizer.rs

/// Removes leading and trailing whitespace and collapses internal runs
/// of whitespace into a single space.
pub fn normalize(input: &amp;str) -&gt; String {
    input.split_whitespace()           // split on any whitespace
         .collect::&lt;Vec&lt;&amp;str&gt;&gt;()
         .join(" ")                    // join with single space
}

/// Returns true if the string contains only ASCII letters and digits.
pub fn is_alphanumeric(s: &amp;str) -&gt; bool {
    s.chars().all(|c| c.is_ascii_alphanumeric())
}

// Private helper — users never need to know this exists
fn strip_control_chars(s: &amp;str) -&gt; String {
    s.chars().filter(|c| !c.is_control()).collect()
}</code></pre>
</div>

<h2>Designing the Prelude Pattern</h2>

<p>Popular libraries like <code>serde</code> and <code>rayon</code> offer a <code>prelude</code> module. Users write <code>use my_lib::prelude::*;</code> to import the most commonly needed items in one shot. This is a deliberate, curated shortcut.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/lib.rs
pub mod sanitizer;
pub mod config;

// The prelude: star-import friendly — only the most-used items
pub mod prelude {
    pub use crate::sanitizer::{normalize, is_alphanumeric};
    pub use crate::config::Config;
}

// --- User code in another crate ---
// use my_lib::prelude::*;   // one line gives access to all common items</code></pre>
</div>

<h2>Choosing What to Expose</h2>

<p>A useful rule: <em>start with everything private, then make items public only when there is a concrete need.</em> Once something is <code>pub</code> in a published crate, removing it is a breaking change. Over-exposing internals traps you.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub struct Database {
    pub name: String,   // OK to expose — users set this
    connection: String, // PRIVATE — users should not manipulate raw connection strings
    pool_size: usize,   // PRIVATE — internal implementation detail
}

impl Database {
    // Constructor is public — this is how users create a Database
    pub fn new(name: &amp;str) -&gt; Self {
        Database {
            name: name.to_string(),
            connection: String::new(),
            pool_size: 4,             // sensible default, hidden from user
        }
    }

    // Provide a method to configure what they need — no raw field access
    pub fn with_pool_size(mut self, size: usize) -&gt; Self {
        self.pool_size = size;
        self
    }
}</code></pre>
</div>

<h2>Feature Flags</h2>

<p>Libraries often have optional capabilities (like async support or JSON serialization) that not every user needs. Cargo <strong>features</strong> let users opt in to extra functionality without pulling in unnecessary dependencies.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># Cargo.toml
[features]
default = []                   # nothing extra by default
async   = ["dep:tokio"]        # enable tokio only when async feature requested
json    = ["dep:serde_json"]   # enable serde_json only when json feature requested

[dependencies]
tokio      = { version = "1", optional = true }
serde_json = { version = "1", optional = true }</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// In src/lib.rs — conditionally compile async code
#[cfg(feature = "async")]
pub mod async_client;  // only compiled when user enables the "async" feature

#[cfg(feature = "json")]
pub fn to_json(data: &amp;str) -&gt; String {
    // serde_json is guaranteed to exist here
    serde_json::to_string(data).unwrap_or_default()
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># User's Cargo.toml — opting in to the json feature
[dependencies]
my_lib = { version = "1", features = ["json"] }</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Making everything <code>pub</code> by default</div>
  <p>Exposing internal types locks your API. If you later want to refactor, every public item is a promise you have to keep.</p>
</div>

<div class="callout">
  <div class="callout-label">Mistake 2: Leaking implementation types in the public API</div>
  <p>If your public function returns an internal type the user cannot construct or inspect, it becomes useless to them.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN — InternalHandle is private but returned from a pub function
struct InternalHandle { id: u32 }

pub fn get_handle() -&gt; InternalHandle { // ERROR: InternalHandle is private
    InternalHandle { id: 1 }
}

// FIXED — either make the type pub or return a pub wrapper/trait
pub struct Handle { pub id: u32 }

pub fn get_handle() -&gt; Handle {
    Handle { id: 1 }
}</code></pre>
</div>
`
  },

  /* =========================================================
     ch58 — Idiomatic Rust Patterns
  ========================================================= */
  'ch58': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 58,
    title: 'Idiomatic Rust Patterns',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 58</span>
</div>
<h1>Idiomatic Rust Patterns</h1>

<p>Every language has patterns that feel natural in it. Writing "Pythonic" code or "idiomatic Go" means using the language the way its designers intended. Idiomatic Rust means writing code that works with the type system and ownership model rather than against it. These patterns appear constantly in professional Rust code and in the standard library itself.</p>

<h2>The Builder Pattern</h2>

<p>Imagine configuring a sandwich at a deli. Instead of one massive order form with 20 required fields, the deli hands you a tray and lets you add items one at a time. The builder pattern works exactly like this: you construct complex objects step by step, with sensible defaults for anything you do not specify.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// The final product — what the user actually wants
struct HttpRequest {
    url:     String,
    method:  String,
    timeout: u32,
    headers: Vec&lt;(String, String)&gt;,
}

// The builder accumulates the configuration
struct HttpRequestBuilder {
    url:     String,
    method:  String,
    timeout: u32,
    headers: Vec&lt;(String, String)&gt;,
}

impl HttpRequestBuilder {
    // Start with the required field and sensible defaults
    pub fn new(url: &amp;str) -&gt; Self {
        HttpRequestBuilder {
            url:     url.to_string(),
            method:  "GET".to_string(),  // default
            timeout: 30,                  // default 30 seconds
            headers: Vec::new(),
        }
    }

    // Each setter returns \`self\` so calls can be chained
    pub fn method(mut self, m: &amp;str) -&gt; Self {
        self.method = m.to_string();
        self
    }

    pub fn timeout(mut self, secs: u32) -&gt; Self {
        self.timeout = secs;
        self
    }

    pub fn header(mut self, key: &amp;str, value: &amp;str) -&gt; Self {
        self.headers.push((key.to_string(), value.to_string()));
        self
    }

    // build() consumes the builder and produces the final object
    pub fn build(self) -&gt; HttpRequest {
        HttpRequest {
            url:     self.url,
            method:  self.method,
            timeout: self.timeout,
            headers: self.headers,
        }
    }
}

fn main() {
    // Fluent, readable construction — only specify what differs from defaults
    let req = HttpRequestBuilder::new("https://example.com/api")
        .method("POST")
        .timeout(60)
        .header("Content-Type", "application/json")
        .build();

    println!("Sending {} to {}", req.method, req.url);
}</code></pre>
</div>

<h2>The Newtype Pattern</h2>

<p>Sometimes you want a type that behaves exactly like an existing type but is distinct in the type system. Think of kilometers vs miles: both are numbers, but confusing them is a real problem. The newtype pattern wraps a type in a single-field struct to create a distinct identity.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Without newtype — easy to confuse kilometers and miles
fn travel(distance: f64) { println!("Travelling {}...", distance); }

// With newtype — compiler catches unit confusion at compile time
struct Kilometers(f64);  // tuple struct wrapping f64
struct Miles(f64);

fn travel_km(distance: Kilometers) {
    println!("Travelling {} km", distance.0); // .0 accesses the inner value
}

fn main() {
    let d_km = Kilometers(42.0);
    let d_mi = Miles(26.0);

    travel_km(d_km);           // OK
    // travel_km(d_mi);        // ERROR: type mismatch — Miles is not Kilometers
                               // The compiler saves you from a unit bug!
}</code></pre>
</div>

<p>The newtype pattern also lets you implement traits on foreign types that you otherwise cannot touch (this is called the <em>orphan rule</em>).</p>

<h2>RAII — Resource Acquisition Is Initialization</h2>

<p>RAII is the principle that a resource (file, lock, connection) is tied to an object's lifetime. When the object is created, the resource is acquired. When the object is dropped (goes out of scope), the resource is released — automatically, with no manual cleanup needed.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;
use std::io::Write;

fn write_log(message: &amp;str) {
    // File is opened (resource acquired)
    let mut file = File::create("log.txt").expect("failed to create file");

    file.write_all(message.as_bytes()).expect("write failed");

    // At the end of this function, \`file\` is dropped automatically
    // Rust calls Drop::drop(), which closes the file handle
    // No need to call file.close() — it cannot be forgotten
}

fn main() {
    write_log("Application started\n");
    // log.txt is guaranteed to be closed here
}</code></pre>
</div>

<h2>The Typestate Pattern</h2>

<p>The typestate pattern uses Rust's type system to enforce that operations happen in the correct order. Each state is a different type, so the compiler rejects invalid sequences.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// States are zero-sized marker structs
struct Closed;
struct Open;

// Door is generic over its state
struct Door&lt;State&gt; {
    label: String,
    _state: std::marker::PhantomData&lt;State&gt;, // carries type info without storing data
}

impl Door&lt;Closed&gt; {
    pub fn new(label: &amp;str) -&gt; Self {
        Door { label: label.to_string(), _state: std::marker::PhantomData }
    }

    // open() is only available on a Closed door — returns an Open door
    pub fn open(self) -&gt; Door&lt;Open&gt; {
        println!("Opening {}", self.label);
        Door { label: self.label, _state: std::marker::PhantomData }
    }
}

impl Door&lt;Open&gt; {
    // close() is only available on an Open door
    pub fn close(self) -&gt; Door&lt;Closed&gt; {
        println!("Closing {}", self.label);
        Door { label: self.label, _state: std::marker::PhantomData }
    }

    pub fn walk_through(&amp;self) {
        println!("Walking through {}", self.label);
    }
}

fn main() {
    let door = Door::&lt;Closed&gt;::new("Front Door");
    // door.walk_through(); // ERROR: method not available on Closed door
    let door = door.open();
    door.walk_through();    // OK — door is Open
    let _door = door.close();
    // door.walk_through(); // ERROR: door is moved and now Closed
}</code></pre>
</div>

<h2>Using <code>Default</code> Trait</h2>

<p>The <code>Default</code> trait gives a type a meaningful zero value. Implementing it (or deriving it) makes your types play well with the standard library and with builder patterns.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug, Default)]
struct Config {
    debug:    bool,    // defaults to false
    workers:  usize,   // defaults to 0
    name:     String,  // defaults to ""
}

fn main() {
    let cfg = Config::default();
    println!("{:?}", cfg); // Config { debug: false, workers: 0, name: "" }

    // Useful with struct update syntax — fill in only what differs
    let custom = Config {
        debug: true,
        workers: 4,
        ..Config::default() // name stays ""
    };
    println!("{:?}", custom);
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Not returning <code>self</code> from builder methods</div>
  <p>If a builder method does not return <code>Self</code>, the chain breaks and the user must store intermediate results in variables.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN — method returns () so chaining is impossible
impl Builder {
    pub fn timeout(&amp;mut self, t: u32) {  // returns nothing
        self.timeout = t;
    }
}
let mut b = Builder::new();
b.timeout(30);      // must use separate statement — cannot chain

// FIXED — return Self for chaining
impl Builder {
    pub fn timeout(mut self, t: u32) -&gt; Self {
        self.timeout = t;
        self  // return self so the next call can chain
    }
}
let b = Builder::new().timeout(30).build(); // clean chain</code></pre>
</div>
`
  },

  /* =========================================================
     ch59 — Public API Design Principles
  ========================================================= */
  'ch59': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 59,
    title: 'Public API Design Principles',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 59</span>
</div>
<h1>Public API Design Principles</h1>

<p>A public API is a contract. Once you publish a library and someone uses it, changing the API breaks their code. Think of it like the electrical outlet standard in your country: once millions of appliances are built for a specific plug shape, changing the standard is catastrophic. Good API design means thinking hard about what you expose before you expose it.</p>

<h2>Principle 1: Use Types to Prevent Misuse</h2>

<p>The best APIs make invalid states impossible to represent. If your function only accepts positive integers, use a type that can only hold positive integers rather than validating at runtime.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WEAK API — accepts any i32, must panic or error on bad input
pub fn set_retries(n: i32) {
    assert!(n &gt;= 0, "retries must be non-negative");
    // ...
}

// STRONGER API — the type system rejects negative values before runtime
pub fn set_retries(n: u32) { // u32 cannot be negative — compiler enforces this
    // No need for an assertion — invalid values cannot even be passed
}

// STRONGEST API — a dedicated validated newtype
pub struct RetryCount(u32);

impl RetryCount {
    pub fn new(n: u32) -&gt; Option&lt;Self&gt; {
        if n &lt;= 10 { Some(RetryCount(n)) } else { None } // cap at 10
    }
}

pub fn set_retries(count: RetryCount) { /* always valid */ }</code></pre>
</div>

<h2>Principle 2: Accept the Most General Type</h2>

<p>Functions that accept references or trait objects are more flexible than those that insist on owned values. This is the Rust equivalent of the "accept interfaces, return concretes" guideline.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// INFLEXIBLE — only accepts a String, forcing callers to allocate
pub fn print_name(name: String) {
    println!("{}", name);
}

// FLEXIBLE — accepts anything that looks like a string slice
pub fn print_name(name: &amp;str) {
    println!("{}", name);
}

// EVEN MORE FLEXIBLE — accepts String, &str, PathBuf, etc.
pub fn print_name(name: impl AsRef&lt;str&gt;) {
    println!("{}", name.as_ref());
}

fn main() {
    let owned = String::from("Alice");
    print_name("Bob");        // &str literal — works
    print_name(&amp;owned);      // borrowed String — works
    print_name(owned);        // owned String — works (via AsRef)
}</code></pre>
</div>

<h2>Principle 3: Return Meaningful Error Types</h2>

<p>A function that returns <code>Result&lt;T, String&gt;</code> forces callers to parse an error message. A function that returns a specific error enum lets them handle each case programmatically.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::num::ParseIntError;

// WEAK — callers get a string they must parse to understand the error
pub fn parse_port(s: &amp;str) -&gt; Result&lt;u16, String&gt; {
    s.parse::&lt;u16&gt;().map_err(|e| e.to_string())
}

// STRONG — dedicated enum lets callers match on the specific failure
#[derive(Debug)]
pub enum PortError {
    NotANumber(ParseIntError),  // couldn't parse as integer
    OutOfRange(u16),            // parsed, but port &gt; 65535 or reserved
}

pub fn parse_port(s: &amp;str) -&gt; Result&lt;u16, PortError&gt; {
    let n: u16 = s.parse().map_err(PortError::NotANumber)?;
    if n &lt; 1024 {
        Err(PortError::OutOfRange(n))  // reserved ports
    } else {
        Ok(n)
    }
}

fn main() {
    match parse_port("80") {
        Ok(p)                      =&gt; println!("Port: {}", p),
        Err(PortError::NotANumber(e)) =&gt; println!("Not a number: {}", e),
        Err(PortError::OutOfRange(p)) =&gt; println!("Reserved port: {}", p),
    }
}</code></pre>
</div>

<h2>Principle 4: Mark Enums <code>#[non_exhaustive]</code></h2>

<p>When you publish an enum as part of a library, adding a new variant is a breaking change: callers with exhaustive match statements will fail to compile. The <code>#[non_exhaustive]</code> attribute prevents this by requiring callers to include a wildcard arm.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// In your library crate
#[non_exhaustive]  // tells callers: more variants may be added in the future
#[derive(Debug)]
pub enum Status {
    Active,
    Inactive,
    Suspended,
}

// In a downstream crate — the compiler REQUIRES a wildcard arm
fn describe(s: Status) {
    match s {
        Status::Active    =&gt; println!("active"),
        Status::Inactive  =&gt; println!("inactive"),
        Status::Suspended =&gt; println!("suspended"),
        _                 =&gt; println!("unknown status"), // required by #[non_exhaustive]
    }
}
// Now you can add Status::Deleted to the library without breaking this match</code></pre>
</div>

<h2>Principle 5: Implement Common Standard Traits</h2>

<p>Users expect your types to work with standard Rust idioms. Deriving or implementing common traits makes your library feel native.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Derive as many of these as make sense for your type
#[derive(
    Debug,    // lets users print with {:?}
    Clone,    // lets users duplicate values
    PartialEq, Eq,   // lets users compare with == and !=
    Hash,     // lets users use the type as a HashMap key
    Default,  // gives a sensible zero value
)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

// Also consider implementing:
// Display  — for user-facing printing with {}
// From/Into — for type conversions
// Iterator  — if your type is a sequence

use std::fmt;

impl fmt::Display for Point {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "({}, {})", self.x, self.y) // custom human-readable format
    }
}

fn main() {
    let p = Point { x: 3, y: 4 };
    println!("{}", p);   // (3, 4)  — uses Display
    println!("{:?}", p); // Point { x: 3, y: 4 }  — uses Debug
    let p2 = p.clone();
    println!("{}", p == p2); // true — uses PartialEq
}</code></pre>
</div>

<h2>Principle 6: Semantic Versioning</h2>

<p>Rust crates use <strong>semantic versioning</strong> (SemVer): <code>MAJOR.MINOR.PATCH</code>. These numbers carry meaning:</p>

<ul>
  <li><strong>PATCH</strong> (0.1.X): bug fixes, no API changes</li>
  <li><strong>MINOR</strong> (0.X.0): new features added, all existing code still compiles</li>
  <li><strong>MAJOR</strong> (X.0.0): breaking changes — callers must update their code</li>
</ul>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Cargo treats <code>0.X.Y</code> specially: any change to the middle digit (<code>X</code>) is considered potentially breaking. Only once you release <code>1.0.0</code> do the full SemVer guarantees apply.</p>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Accepting owned values when a reference would do</div>
  <p>This forces callers to give up ownership of their data unnecessarily.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN — caller loses ownership of name after calling this
pub fn greet(name: String) { println!("Hi, {}", name); }

fn main() {
    let name = String::from("Alice");
    greet(name);         // name is moved
    // println!("{}", name); // ERROR: name was moved into greet
}

// FIXED — borrow instead
pub fn greet(name: &amp;str) { println!("Hi, {}", name); }

fn main() {
    let name = String::from("Alice");
    greet(&amp;name);        // only borrows — name is still available
    println!("{}", name); // OK
}</code></pre>
</div>
`
  },

  /* =========================================================
     ch60 — Documentation & rustdoc
  ========================================================= */
  'ch60': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 60,
    title: 'Documentation & rustdoc',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 60</span>
</div>
<h1>Documentation &amp; rustdoc</h1>

<p>Good documentation is like a well-labeled map. A brilliant library with no documentation is like a treasure chest with no key. Rust has first-class documentation tools built right into the language and Cargo. The tool is called <strong>rustdoc</strong>, and it turns special comments in your code into a beautiful HTML website.</p>

<h2>Doc Comments: <code>///</code> and <code>//!</code></h2>

<p>Rust has two kinds of documentation comments, both written in Markdown:</p>

<dl>
  <dt><code>///</code> (outer doc comment)</dt>
  <dd>Documents the item that follows it: a function, struct, enum, field, etc.</dd>
  <dt><code>//!</code> (inner doc comment)</dt>
  <dd>Documents the item that contains it: typically used at the top of <code>lib.rs</code> to document the whole crate, or at the top of a module file.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">//! # My Library
//!
//! This crate provides utilities for working with geometric shapes.
//! It is designed for performance and ease of use.

/// Represents a 2D point in Cartesian space.
///
/// # Examples
///
/// \`\`\`
/// let origin = Point { x: 0.0, y: 0.0 };
/// \`\`\`
pub struct Point {
    /// The horizontal coordinate.
    pub x: f64,
    /// The vertical coordinate.
    pub y: f64,
}

/// Computes the distance between two points using the Pythagorean theorem.
///
/// # Arguments
///
/// * \`a\` - The first point
/// * \`b\` - The second point
///
/// # Returns
///
/// The Euclidean distance as an f64.
///
/// # Examples
///
/// \`\`\`
/// let a = Point { x: 0.0, y: 0.0 };
/// let b = Point { x: 3.0, y: 4.0 };
/// assert_eq!(distance(&a, &b), 5.0);
/// \`\`\`
pub fn distance(a: &amp;Point, b: &amp;Point) -&gt; f64 {
    let dx = a.x - b.x;  // difference in x
    let dy = a.y - b.y;  // difference in y
    (dx * dx + dy * dy).sqrt()
}</code></pre>
</div>

<h2>Standard Documentation Sections</h2>

<p>By convention, most Rust doc comments include these sections using Markdown headings:</p>

<dl>
  <dt><code># Examples</code></dt>
  <dd>Shows how to use the item. These are run as tests by <code>cargo test</code>.</dd>
  <dt><code># Panics</code></dt>
  <dd>Describes conditions under which the function will panic.</dd>
  <dt><code># Errors</code></dt>
  <dd>For functions returning <code>Result</code>, describes what errors can be returned.</dd>
  <dt><code># Safety</code></dt>
  <dd>For <code>unsafe</code> functions, describes what the caller must guarantee.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::num::ParseIntError;

/// Parses a port number from a string.
///
/// # Errors
///
/// Returns an error if the string is not a valid integer
/// or if the value is outside the range 1024–65535.
///
/// # Panics
///
/// This function does not panic.
///
/// # Examples
///
/// \`\`\`
/// assert_eq!(parse_port("8080"), Ok(8080));
/// assert!(parse_port("abc").is_err());
/// \`\`\`
pub fn parse_port(s: &amp;str) -&gt; Result&lt;u16, ParseIntError&gt; {
    s.parse::&lt;u16&gt;()
}</code></pre>
</div>

<h2>Doc Tests — Examples That Are Also Tests</h2>

<p>Every code block inside a <code>///</code> comment is compiled and run by <code>cargo test</code>. This means your documentation examples are always verified to be correct. If you change the function and forget to update the example, the test suite catches it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">/// Adds two numbers together.
///
/// # Examples
///
/// \`\`\`
/// // This code block is compiled and run by \`cargo test\`
/// let result = add(2, 3);
/// assert_eq!(result, 5);
/// \`\`\`
pub fn add(a: i32, b: i32) -&gt; i32 {
    a + b
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># Run all tests including doc tests
cargo test

# Run only doc tests
cargo test --doc</code></pre>
</div>

<p>If an example is meant to show code that does NOT compile (to illustrate an error), mark it <code>compile_fail</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">/// \`\`\`compile_fail
/// // This is expected to fail compilation — shows a common mistake
/// let v: Vec&lt;i32&gt; = Vec::new();
/// v.push(1);  // ERROR: v is not mut
/// \`\`\`
pub fn example_fn() {}</code></pre>
</div>

<h2>Generating and Viewing Documentation</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># Generate HTML docs for your crate
cargo doc

# Generate and immediately open in your browser
cargo doc --open

# Include documentation for dependencies too
cargo doc --document-private-items  # also show private items (for internal reference)</code></pre>
</div>

<p>The generated HTML is placed in <code>target/doc/&lt;crate_name&gt;/index.html</code>.</p>

<h2>Linking to Other Items</h2>

<p>Rustdoc supports intra-doc links: you can link to other items in your crate using backtick notation.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub struct Circle {
    pub radius: f64,
}

impl Circle {
    /// Creates a new [\`Circle\`] with the given radius.
    ///
    /// See also [\`Circle::area\`] for computing the area.
    pub fn new(radius: f64) -&gt; Self {
        Circle { radius }
    }

    /// Computes the area of this [\`Circle\`].
    ///
    /// Uses the formula: area = π * r²
    pub fn area(&amp;self) -&gt; f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Broken doc test examples</div>
  <p>If your example uses a function from the same crate, you must bring it into scope. Doc tests run in isolation.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN doc test — add() is not in scope inside the doc test
/// \`\`\`
/// assert_eq!(add(1, 2), 3); // ERROR: add not found
/// \`\`\`
pub fn add(a: i32, b: i32) -&gt; i32 { a + b }

// FIXED — explicitly import the function
/// \`\`\`
/// use my_crate::add;
/// assert_eq!(add(1, 2), 3); // OK
/// \`\`\`
pub fn add(a: i32, b: i32) -&gt; i32 { a + b }</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Mistake 2: Documenting the "what" instead of the "why"</div>
  <p>Good documentation explains when and why to use something, not just what the code does. The code already shows what it does.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// USELESS doc — just restates the function signature
/// Divides a by b.
pub fn divide(a: f64, b: f64) -&gt; f64 { a / b }

// USEFUL doc — tells the user what they need to know
/// Divides \`a\` by \`b\`.
///
/// # Panics
///
/// Panics if \`b\` is zero.
///
/// # Examples
///
/// \`\`\`
/// assert_eq!(divide(10.0, 2.0), 5.0);
/// \`\`\`
pub fn divide(a: f64, b: f64) -&gt; f64 {
    assert_ne!(b, 0.0, "cannot divide by zero");
    a / b
}</code></pre>
</div>
`
  },

  /* =========================================================
     ch61 — Testing
  ========================================================= */
  'ch61': {
    moduleNum: 9,
    moduleTitle: 'Modules, Crates & API Design',
    chNum: 61,
    title: 'Testing',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 9 &mdash; Chapter 61</span>
</div>
<h1>Testing</h1>

<p>Testing in Rust is like having a quality inspector at every step of a factory assembly line. Instead of waiting until the product is finished to check for defects, you check each component as it is made. Rust makes testing a first-class citizen: the testing framework is built into Cargo, and you can write tests right next to the code they test.</p>

<h2>Unit Tests with <code>#[test]</code></h2>

<p>Any function marked <code>#[test]</code> is a test function. Cargo collects all test functions and runs them when you call <code>cargo test</code>. Tests pass if they complete without panicking; they fail if they panic.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// src/lib.rs

pub fn add(a: i32, b: i32) -&gt; i32 {
    a + b
}

pub fn is_even(n: i32) -&gt; bool {
    n % 2 == 0
}

// Tests are typically placed in a module at the bottom of the file
#[cfg(test)]          // only compiled when running tests — excluded from production build
mod tests {
    use super::*;     // import everything from the parent module

    #[test]
    fn test_add_positive() {
        assert_eq!(add(2, 3), 5);    // panics if 2+3 != 5
    }

    #[test]
    fn test_add_negative() {
        assert_eq!(add(-1, -1), -2);
    }

    #[test]
    fn test_is_even() {
        assert!(is_even(4));          // panics if is_even(4) is false
        assert!(!is_even(7));         // panics if is_even(7) is true
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo test              # run all tests
cargo test test_add     # run only tests whose name contains "test_add"
cargo test -- --nocapture  # show println! output during tests</code></pre>
</div>

<h2>Assertion Macros</h2>

<p>Rust's testing macros give clear failure messages that tell you exactly what went wrong:</p>

<dl>
  <dt><code>assert!(condition)</code></dt>
  <dd>Panics if <code>condition</code> is false.</dd>
  <dt><code>assert_eq!(left, right)</code></dt>
  <dd>Panics if <code>left != right</code>. Prints both values on failure.</dd>
  <dt><code>assert_ne!(left, right)</code></dt>
  <dd>Panics if <code>left == right</code>.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[cfg(test)]
mod tests {
    #[test]
    fn demo_assertions() {
        // assert_eq shows both values if they differ — very helpful for debugging
        assert_eq!(2 + 2, 4);            // passes
        assert_ne!("hello", "world");    // passes — they are not equal

        // Custom failure message (printf-style formatting allowed)
        let x = 10;
        assert!(x &gt; 5, "expected x > 5, got {}", x);
    }

    #[test]
    #[should_panic]  // this test PASSES only if the code panics
    fn test_divide_by_zero() {
        let _ = 10 / 0;  // integer division by zero panics in Rust
    }

    #[test]
    #[should_panic(expected = "cannot be zero")]  // panic message must contain this string
    fn test_specific_panic() {
        panic!("value cannot be zero");
    }
}</code></pre>
</div>

<h2>Testing <code>Result</code>-Returning Functions</h2>

<p>Test functions can also return <code>Result&lt;(), E&gt;</code>. If they return <code>Err</code>, the test fails and the error is displayed. This works well with the <code>?</code> operator.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::num::ParseIntError;

pub fn parse_number(s: &amp;str) -&gt; Result&lt;i32, ParseIntError&gt; {
    s.parse::&lt;i32&gt;()
}

#[cfg(test)]
mod tests {
    use super::*;

    // Return Result — use ? to propagate errors; Err means test failure
    #[test]
    fn test_parse_valid() -&gt; Result&lt;(), std::num::ParseIntError&gt; {
        let n = parse_number("42")?;   // ? unwraps or fails the test
        assert_eq!(n, 42);
        Ok(())
    }

    #[test]
    fn test_parse_invalid() {
        // parse_number on non-numeric input should return Err
        assert!(parse_number("abc").is_err());
    }
}</code></pre>
</div>

<h2>Integration Tests</h2>

<p>Integration tests live in a separate <code>tests/</code> directory at the project root. They test your library from the outside, the same way a real user would use it. Each file in <code>tests/</code> is a separate test binary.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">text</span>
  <pre><code class="language-text">my_lib/
  src/
    lib.rs
  tests/
    basic_usage.rs    &lt;-- integration test file
    advanced_usage.rs &lt;-- another integration test file</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// tests/basic_usage.rs — no #[cfg(test)] needed here; the file IS a test

// Import your library by name (must be a library crate, not just a binary)
use my_lib::add;

#[test]
fn test_add_from_outside() {
    // This tests the public API exactly as a user would call it
    assert_eq!(add(10, 20), 30);
}

#[test]
fn test_multiple_additions() {
    let result = add(add(1, 2), add(3, 4));
    assert_eq!(result, 10);
}</code></pre>
</div>

<h2>Test Organization Tips</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[cfg(test)]
mod tests {
    use super::*;

    // Group related tests using nested modules
    mod addition {
        use super::*;

        #[test]
        fn positive_numbers() { assert_eq!(add(1, 2), 3); }

        #[test]
        fn negative_numbers() { assert_eq!(add(-1, -2), -3); }

        #[test]
        fn zero() { assert_eq!(add(0, 5), 5); }
    }

    mod is_even_tests {
        use super::*;

        #[test]
        fn even_input()  { assert!(is_even(4)); }

        #[test]
        fn odd_input()   { assert!(!is_even(3)); }

        #[test]
        fn zero_is_even() { assert!(is_even(0)); }
    }
}</code></pre>
</div>

<h2>Running Specific Tests and Filtering</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo test                        # run every test in the project
cargo test addition               # run only tests with "addition" in the name
cargo test tests::addition::zero  # run one specific test by full path
cargo test --lib                  # only unit tests (in src/)
cargo test --test basic_usage     # only the basic_usage.rs integration test
cargo test -- --test-threads=1   # run tests one at a time (no parallelism)</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Mistake 1: Forgetting <code>use super::*;</code> in the test module</div>
  <p>Without it, the functions from the parent module are not in scope and you get "not found" errors.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
#[cfg(test)]
mod tests {
    #[test]
    fn test_add() {
        assert_eq!(add(1, 2), 3); // ERROR: add is not in scope
    }
}

// FIXED
#[cfg(test)]
mod tests {
    use super::*;  // brings add, is_even, etc. into scope
    #[test]
    fn test_add() {
        assert_eq!(add(1, 2), 3); // OK
    }
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Mistake 2: Integration tests for binary-only crates</div>
  <p>Integration tests in <code>tests/</code> can only import library crates (with <code>lib.rs</code>). They cannot import code from <code>main.rs</code>. Move testable logic to a library crate.</p>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN — integration test trying to use binary-only code
// tests/my_test.rs
use my_binary::some_function; // ERROR: my_binary has no lib.rs

// FIXED — move logic to lib.rs, keep main.rs thin
// src/lib.rs  -- has some_function()
// src/main.rs -- calls some_function from lib
// tests/my_test.rs -- can now import from lib
use my_crate::some_function; // OK</code></pre>
</div>
`
  },

});
