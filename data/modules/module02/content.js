/* ================================================================
   Module 2: Core Language Basics
   Chapters: 5 - 11
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 5: Variables, Mutability & Shadowing
     --------------------------------------------------------------- */
  'ch05': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 5,
    title: 'Variables, Mutability & Shadowing',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 5</span>
</div>

<h1>Variables, Mutability &amp; Shadowing</h1>

<p>Every program needs to hold information while it runs. You might need to track a player's score, remember whether a door is open, or keep a user's name around for a greeting. In most languages you have seen, you store information in a variable and change it freely whenever you need to. Rust takes a deliberately different approach: <strong>variables are immutable by default</strong>.</p>

<p>This is not an oversight. It is a core safety feature. The compiler uses immutability to catch a whole class of bugs at compile time instead of letting them silently corrupt your program at runtime. Once you understand why Rust works this way, and how to opt in to mutability when you genuinely need it, you will start to see the design as an advantage rather than a restriction.</p>

<h2>The Sticky-Note Analogy</h2>

<p>Imagine writing something important on a sticky note and then laminating it. It is now permanent. Everyone can read it, but nobody can change it. That is an immutable variable in Rust: you write a value once, and the compiler guarantees it will never be silently overwritten.</p>

<p>A mutable variable is more like a whiteboard. You can erase and rewrite whenever you need to. The important distinction is that in Rust you have to <em>explicitly</em> ask for a whiteboard. Everything starts as a laminated sticky note.</p>

<h2>Immutable Variables</h2>

<p>You create a variable with the <code>let</code> keyword. By default, the value is locked in place the moment you assign it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;
    println!("x is {}", x);
}</code></pre>
</div>

<p>That works perfectly. Now try to change <code>x</code> after it has been assigned:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;
    println!("x is {}", x);
    x = 10; // This line will not compile
    println!("x is now {}", x);
}</code></pre>
</div>

<p>The compiler refuses to build this program and gives you a precise error:</p>

<pre class="output"><code>error[E0384]: cannot assign twice to immutable variable \`x\`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         -
  |         |
  |         first assignment to \`x\`
4 |     x = 10;
  |     ^^^^^^ cannot assign twice to immutable variable</code></pre>

<p>Notice how the error message tells you exactly which line made the first assignment and exactly where the illegal second assignment is. Rust's compiler errors are designed to teach, not just to block.</p>

<div class="callout">
  <div class="callout-label">Why does this matter?</div>
  <p>Many bugs in real software come from a value being changed in one place when code somewhere else assumed it would stay the same. By making immutability the default, Rust forces you to be explicit about what changes, making code easier to reason about.</p>
</div>

<h2>Mutable Variables</h2>

<p>When you genuinely need a value to change, add <code>mut</code> (short for mutable) right after <code>let</code>. This is a signal to both the compiler and to anyone reading your code: "the value stored here is meant to change."</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut score = 0;
    println!("Starting score: {}", score);

    score = 10;
    println!("After level 1: {}", score);

    score += 5;
    println!("After bonus: {}", score);
}</code></pre>
</div>

<pre class="output"><code>Starting score: 0
After level 1: 10
After bonus: 15</code></pre>

<p>The <code>mut</code> keyword applies to the entire variable. Once you declare a variable as mutable, you can reassign it as many times as you need within its scope.</p>

<div class="callout">
  <div class="callout-label">Style Tip</div>
  <p>When you see <code>mut</code> in code, treat it as a red flag worth paying attention to. It tells you: "this value is going to change somewhere, so track it carefully." When you do not see <code>mut</code>, you know the value is stable for the rest of its lifetime.</p>
</div>

<h2>Constants</h2>

<p>Rust also has constants, which are different from immutable variables in important ways. Think of a constant as a value carved in stone at compile time: it can never change, it exists for the entire life of the program, and it is available everywhere.</p>

<p>Three rules apply to constants:</p>

<dl>
  <dt>You must specify the type</dt>
  <dd>Rust infers types for regular variables, but constants require an explicit type annotation. There is no inference for them.</dd>
  <dt>The value must be computable at compile time</dt>
  <dd>You cannot use a runtime function call or a runtime variable to set a constant's value. Simple arithmetic like <code>60 * 60</code> is fine because the compiler can calculate it before your program runs.</dd>
  <dt>You declare them with <code>const</code>, not <code>let</code></dt>
  <dd>Constants can live outside of any function, at the module level, making them truly global.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">const MAX_PLAYER_LIVES: u32 = 3;
const SECONDS_IN_AN_HOUR: u32 = 60 * 60;

fn main() {
    println!("Lives: {}", MAX_PLAYER_LIVES);
    println!("Seconds per hour: {}", SECONDS_IN_AN_HOUR);
}</code></pre>
</div>

<pre class="output"><code>Lives: 3
Seconds per hour: 3600</code></pre>

<p>Notice the naming convention: constants use <strong>SCREAMING_SNAKE_CASE</strong> (all uppercase letters with underscores). This is not enforced by the compiler, but it is a strong convention across the Rust ecosystem, and the compiler will warn you if you name a constant in lowercase.</p>

<h2>Shadowing</h2>

<p>Shadowing is one of Rust's most surprising features for people coming from other languages. The idea is simple: you can declare a brand new variable using the same name as an existing variable. The new variable "shadows" the old one, meaning the old name now refers to the new variable.</p>

<p>Think of it like putting a new sticky note on top of the old one. The original is still there underneath, but you can only see and use the one on top.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;
    let x = x + 1; // shadows the first x
    println!("x is {}", x);
}</code></pre>
</div>

<pre class="output"><code>x is 6</code></pre>

<p>The critical thing to notice: each shadowing uses the <code>let</code> keyword. You are not modifying the original variable. You are creating a completely new variable that happens to have the same name.</p>

<h3>Shadowing with Inner Scopes</h3>

<p>A <strong>scope</strong> in Rust is a block of code wrapped in curly braces <code>{}</code>. Variables declared inside a scope live only until that scope ends. Shadowing inside a scope is temporary: when the inner scope ends, the original variable comes back into view.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;

    {
        let x = x * 2; // shadows x only inside this block
        println!("Inside block: x = {}", x); // 10
    }

    // The inner shadow is gone. Original x is visible again.
    println!("Outside block: x = {}", x); // 5
}</code></pre>
</div>

<pre class="output"><code>Inside block: x = 10
Outside block: x = 5</code></pre>

<p>The original <code>x</code> was never modified. The inner <code>let x = x * 2</code> created a separate variable in the inner scope. Once that scope ended, it disappeared, and the original <code>x = 5</code> became visible again.</p>

<h3>Shadowing to Change Types</h3>

<p>One of the most practical uses of shadowing is reusing a name for a transformed version of a value, even if the type changes. Without shadowing, you would need to invent different names like <code>input_str</code> and <code>input_num</code>. With shadowing, you can call both <code>input</code> and let the name reflect what the value represents, not its type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // First, input is a piece of text
    let input = "hello world";

    // Now, input is the number of characters in that text
    let input = input.len();

    println!("Character count: {}", input);
}</code></pre>
</div>

<pre class="output"><code>Character count: 11</code></pre>

<p>The first <code>input</code> held a string slice (<code>&amp;str</code>). The second <code>input</code> holds a number (<code>usize</code>). These are completely different types. Shadowing makes this legal and clean.</p>

<h2>Shadowing vs Mutability: The Key Distinction</h2>

<p>This is the concept that confuses almost every Rust beginner. Shadowing and mutability look similar on the surface but are fundamentally different mechanisms. Understanding the distinction is essential.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // --- Using mut ---
    // The SAME variable. Value changes. Type cannot change.
    let mut count = 0;
    count = 1;        // OK: still an integer
    // count = "one"; // COMPILE ERROR: mismatched types

    // --- Using shadowing ---
    // A NEW variable with the same name. Type CAN change.
    let label = "zero";
    let label = 0;    // OK: new variable, new type (integer)
    println!("{}", label);
}</code></pre>
</div>

<p>Here is a side-by-side comparison of the two approaches:</p>

<dl>
  <dt>With <code>mut</code></dt>
  <dd>The same memory location is updated. The type is permanently fixed. You do not need <code>let</code> to reassign. You <em>can</em> change the value, but you cannot change the type.</dd>
  <dt>With shadowing</dt>
  <dd>A brand new variable is created. The old one is hidden but still exists. You must use <code>let</code> every time. You can change both the value and the type.</dd>
</dl>

<p>The following example shows exactly what happens when you try to use <code>mut</code> to change a type, compared to using shadowing:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // This FAILS: mut does not allow type changes
    let mut spaces = "   ";
    // spaces = spaces.len(); // ERROR: expected &str, found usize

    // This WORKS: shadowing allows type changes
    let spaces = "   ";
    let spaces = spaces.len();
    println!("Spaces: {}", spaces); // 3
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Rule of Thumb</div>
  <p>Use <code>mut</code> when the same variable needs to accumulate or update a value of the same type over time, like a counter or a running total. Use shadowing when you are transforming a value into something new, especially if the type changes.</p>
</div>

<h2>Unused Variables and the Underscore Convention</h2>

<p>Rust's compiler will warn you if you declare a variable and never use it. This is helpful: unused variables often indicate a mistake or leftover code. If you intentionally want a variable that you will not use (perhaps as a placeholder during development), prefix its name with an underscore to silence the warning.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let result = 42;        // Warning: unused variable
    let _placeholder = 99;  // No warning: underscore prefix signals intentional disuse
    println!("{}", result);
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Reassigning without <code>let</code> when you meant to shadow</h3>

<p>Shadowing requires <code>let</code>. Forgetting it makes Rust think you are trying to reassign an immutable variable, which is an error.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: missing let, looks like a reassignment
fn main() {
    let x = 5;
    x = x + 1; // error: cannot assign twice to immutable variable
    println!("{}", x);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: add let to create a shadow
fn main() {
    let x = 5;
    let x = x + 1; // correct: this shadows, not reassigns
    println!("{}", x); // 6
}</code></pre>
</div>

<h3>Mistake 2: Trying to change a variable's type using <code>mut</code></h3>

<p>Once a mutable variable is declared with a type, that type is fixed for the life of the variable. You can change the value but never the type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: trying to assign a number to a text variable
fn main() {
    let mut message = "hello";
    message = 42; // error: mismatched types, expected &str, found integer
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use shadowing to reuse the name with a new type
fn main() {
    let message = "hello";
    let message = 42; // OK: new variable, new type
    println!("{}", message); // 42
}</code></pre>
</div>

<h3>Mistake 3: Forgetting the type on a constant</h3>

<p>Unlike regular variables, constants require an explicit type annotation. Rust does not infer types for constants.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: missing type annotation
const RETRIES = 3; // error: missing type for \`const\` item</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: type annotation required
const RETRIES: u32 = 3;</code></pre>
</div>

<h3>Mistake 4: Expecting an inner-scope shadow to affect the outer variable</h3>

<p>Shadowing inside a block is local to that block. The moment the block ends, the outer variable is fully restored.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// MISUNDERSTANDING: thinking the inner shadow persists
fn main() {
    let x = 5;
    {
        let x = 99;
        println!("inner: {}", x); // 99
    }
    // x is 5 here, NOT 99
    println!("outer: {}", x); // 5
}</code></pre>
</div>

<p>This is correct Rust, but many beginners expect the outer <code>x</code> to also become 99. It does not. The inner shadow is completely isolated to its block.</p>
`
  },


  /* ---------------------------------------------------------------
     Chapter 6: Primitive Types
     --------------------------------------------------------------- */
  'ch06': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 6,
    title: 'Primitive Types',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 6</span>
</div>

<h1>Primitive Types</h1>

<p>Every piece of data in a Rust program has a type. The type tells the compiler how much memory to allocate, how to interpret the bytes, and what operations are allowed. Rust is a <strong>statically typed</strong> language, which means the compiler must know the type of every variable at compile time, before the program ever runs.</p>

<p>Rust's primitive types fall into two categories: <strong>scalar types</strong> (a single value) and <strong>compound types</strong> (multiple values grouped together). This chapter covers all of them.</p>

<h2>The LEGO Analogy</h2>

<p>Think of types as LEGO brick sizes. A 1x1 brick, a 2x4 brick, and a 4x8 brick can all hold the same colour plastic, but they take up different amounts of space and serve different purposes. Choosing the right type is like choosing the right brick: use the smallest one that fits the job. Wasting memory on a 128-bit integer to hold the number 3 is like using a massive brick where a tiny one would do.</p>

<h2>Scalar Types: A Single Value</h2>

<p>Rust has four scalar primitive types: integers, floating-point numbers, booleans, and characters. Each holds exactly one value.</p>

<h2>Integers</h2>

<p>An integer is a whole number with no decimal point. Rust gives you a choice of integer types based on two dimensions: the <strong>size</strong> in bits and whether the type is <strong>signed</strong> (can hold negative numbers) or <strong>unsigned</strong> (only non-negative numbers).</p>

<p>Think of signed integers like a bank account balance: it can go below zero. An unsigned integer is like a counter on a turnstile: it only ever goes up from zero.</p>

<table style="width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:0.875rem;">
  <thead>
    <tr style="background:var(--bg-tertiary);">
      <th style="padding:0.5rem 0.9rem;text-align:left;border:1px solid var(--border);font-weight:700;">Bits</th>
      <th style="padding:0.5rem 0.9rem;text-align:left;border:1px solid var(--border);font-weight:700;">Signed</th>
      <th style="padding:0.5rem 0.9rem;text-align:left;border:1px solid var(--border);font-weight:700;">Unsigned</th>
      <th style="padding:0.5rem 0.9rem;text-align:left;border:1px solid var(--border);font-weight:700;">Signed Range</th>
      <th style="padding:0.5rem 0.9rem;text-align:left;border:1px solid var(--border);font-weight:700;">Unsigned Range</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);">8</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">i8</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">u8</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">-128 to 127</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">0 to 255</td>
    </tr>
    <tr style="background:var(--bg-secondary);">
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);">16</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">i16</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">u16</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">-32,768 to 32,767</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">0 to 65,535</td>
    </tr>
    <tr>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);">32</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">i32</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">u32</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">-2.1B to 2.1B</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">0 to 4.29B</td>
    </tr>
    <tr style="background:var(--bg-secondary);">
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);">64</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">i64</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">u64</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">~-9.2 quintillion to 9.2 quintillion</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);">0 to ~18.4 quintillion</td>
    </tr>
    <tr>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);">128</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">i128</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">u128</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);" colspan="2">Astronomically large numbers</td>
    </tr>
    <tr style="background:var(--bg-secondary);">
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);">arch</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">isize</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);font-family:var(--font-mono);color:var(--accent);">usize</td>
      <td style="padding:0.45rem 0.9rem;border:1px solid var(--border);color:var(--text-secondary);" colspan="2">Depends on CPU: 64-bit on 64-bit systems</td>
    </tr>
  </tbody>
</table>

<p>The <strong>default integer type</strong> is <code>i32</code>. Unless you have a specific reason to choose otherwise (like interacting with C code that uses <code>u8</code>, or indexing a collection with <code>usize</code>), <code>i32</code> is a sensible starting point for most whole number work.</p>

<p><code>isize</code> and <code>usize</code> are special: their size matches the pointer width of your CPU. On a 64-bit machine they are 64 bits wide; on a 32-bit machine, 32 bits. You will use <code>usize</code> frequently for collection indexing.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let small: i8   = -100;          // 8-bit signed
    let byte:  u8   = 255;           // 8-bit unsigned, max value
    let count: u32  = 1_000_000;     // underscore for readability
    let index: usize = 0;            // typically used for indexing

    println!("{} {} {} {}", small, byte, count, index);
}</code></pre>
</div>

<pre class="output"><code>-100 255 1000000 0</code></pre>

<h3>Integer Literals</h3>

<p>Rust lets you write integer literals in multiple formats. All of the following are valid ways to write the number 255:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let decimal     = 255;           // plain decimal
    let with_sep    = 2_550_000;     // underscores for readability
    let hex         = 0xff;          // hexadecimal (0x prefix)
    let octal       = 0o377;         // octal (0o prefix)
    let binary      = 0b1111_1111;   // binary (0b prefix)
    let byte: u8    = b'A';          // byte literal (u8 only), equals 65

    println!("{} {} {} {} {} {}", decimal, with_sep, hex, octal, binary, byte);
}</code></pre>
</div>

<pre class="output"><code>255 2550000 255 255 255 65</code></pre>

<p>You can also attach a type suffix directly to a literal: <code>42u8</code> means "the number 42, as a <code>u8</code>". This is useful when you need to specify a type without declaring a separate annotation.</p>

<h3>Integer Overflow</h3>

<p>What happens if you try to put a value into a type that is too small to hold it? For example, adding 1 to a <code>u8</code> that already holds 255?</p>

<p>In <strong>debug mode</strong> (the default when you run <code>cargo run</code>), Rust detects overflow and causes your program to panic. This is deliberate: a panic in development is far better than silently wrong data.</p>

<p>In <strong>release mode</strong> (<code>cargo build --release</code>), Rust performs two's-complement wrapping instead of panicking: 256 wraps back to 0, 257 wraps to 1, and so on. This is predictable behavior but almost certainly not what you intended, so be careful when shipping code that does arithmetic near type boundaries.</p>

<div class="callout">
  <div class="callout-label">Safe Overflow Handling</div>
  <p>If you know you need overflow behavior, use the explicit methods from the standard library: <code>wrapping_add</code>, <code>saturating_add</code>, <code>checked_add</code>, and <code>overflowing_add</code>. These make your intent obvious to the compiler and to readers.</p>
</div>

<h2>Floating-Point Numbers</h2>

<p>Floating-point types represent numbers with a decimal point. Rust has two: <code>f32</code> (32-bit) and <code>f64</code> (64-bit). The <strong>default is <code>f64</code></strong>, which gives you roughly twice the precision of <code>f32</code> at virtually no performance cost on modern 64-bit CPUs.</p>

<p>Both types follow the IEEE-754 standard, the same standard used by Python, Java, C, and most other languages for floating-point math.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let price = 9.99;           // f64 by default
    let pi: f32 = 3.14159;      // explicitly f32

    let sum = 0.1 + 0.2;        // floating-point imprecision applies here
    println!("{}", sum);        // prints 0.30000000000000004, not 0.3
}</code></pre>
</div>

<pre class="output"><code>0.30000000000000004</code></pre>

<div class="callout">
  <div class="callout-label">Note: Floating-Point Imprecision</div>
  <p>The result 0.30000000000000004 is not a Rust bug. It is a property of IEEE-754 floating-point representation that affects all mainstream programming languages. Decimal fractions like 0.1 and 0.2 cannot be represented exactly in binary, so there is a tiny rounding error. For financial calculations where exact decimal arithmetic matters, use an integer type to represent cents rather than dollars, or reach for a dedicated decimal library.</p>
</div>

<h2>Booleans</h2>

<p>A boolean holds exactly one of two values: <code>true</code> or <code>false</code>. The type is <code>bool</code>. Booleans are one byte in size and are most commonly used in conditional expressions.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let is_logged_in: bool = true;
    let has_permission = false;    // type inferred as bool

    println!("Logged in: {}", is_logged_in);
    println!("Has permission: {}", has_permission);
}</code></pre>
</div>

<pre class="output"><code>Logged in: true
Has permission: false</code></pre>

<div class="callout">
  <div class="callout-label">Important</div>
  <p>In Rust, booleans are not integers. You cannot write <code>if 1 { ... }</code> as you can in C. The condition of an <code>if</code> expression must be a <code>bool</code>. This is enforced at compile time.</p>
</div>

<h2>Characters</h2>

<p>Rust's <code>char</code> type represents a single Unicode character and is declared using <strong>single quotes</strong>. This is different from strings, which use double quotes. A <code>char</code> is 4 bytes in size, large enough to hold any Unicode scalar value.</p>

<p>This means a <code>char</code> in Rust can hold far more than just the 26 letters of the English alphabet. It can hold accented characters, Chinese ideographs, Arabic letters, mathematical symbols, and even emoji.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let letter: char = 'A';
    let accented = 'é';
    let kanji = '漢';
    let emoji = '🦀';    // the Rust mascot

    println!("{} {} {} {}", letter, accented, kanji, emoji);
}</code></pre>
</div>

<pre class="output"><code>A é 漢 🦀</code></pre>

<h2>Compound Types: Tuples</h2>

<p>A tuple groups together a fixed number of values that can have <em>different</em> types. Think of a tuple like a row in a spreadsheet: each column can be a different kind of data (a name, an age, a score), but the structure is fixed once you define it.</p>

<p>Tuples are declared with parentheses. You access individual elements using a dot followed by the index (starting at 0).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let player: (&str, u32, f64) = ("Alice", 42, 9.8);

    println!("Name:  {}", player.0);
    println!("Score: {}", player.1);
    println!("Ratio: {}", player.2);
}</code></pre>
</div>

<pre class="output"><code>Name:  Alice
Score: 42
Ratio: 9.8</code></pre>

<p>You can also <strong>destructure</strong> a tuple, which means unpacking its elements into individual named variables in a single line:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let point = (3, -7);
    let (x, y) = point;   // destructuring

    println!("x = {}, y = {}", x, y);
}</code></pre>
</div>

<pre class="output"><code>x = 3, y = -7</code></pre>

<p>The unit type <code>()</code> is a special empty tuple. It represents "no value" and is what functions implicitly return when they do not return anything useful.</p>

<h2>Compound Types: Arrays</h2>

<p>An array holds a fixed number of values that must all be the <em>same</em> type. Unlike a Vec (which you will learn about in Module 6), an array has a length that is fixed at compile time and stored on the stack.</p>

<p>Think of an array like a row of identical pigeonholes in a post office. Each slot holds the same kind of letter. The number of slots is fixed when the wall is built.</p>

<p>The type of an array is written as <code>[T; N]</code> where <code>T</code> is the element type and <code>N</code> is the length.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let months: [&str; 3] = ["January", "February", "March"];

    // Access by index (0-based)
    println!("First: {}",  months[0]);
    println!("Second: {}", months[1]);

    // Create an array of five zeros
    let zeros = [0; 5];   // [0, 0, 0, 0, 0]
    println!("Zeros: {:?}", zeros);
}</code></pre>
</div>

<pre class="output"><code>First: January
Second: February
Zeros: [0, 0, 0, 0, 0]</code></pre>

<div class="callout">
  <div class="callout-label">Arrays vs Tuples</div>
  <p>Use an array when all elements are the same type and you need indexed access. Use a tuple when you need to group a small number of values of different types together, like a return value that packs multiple pieces of information.</p>
</div>

<h2>Type Inference vs Explicit Annotations</h2>

<p>Rust's compiler is smart enough to infer the type of most variables from context. However, there are situations where it cannot figure out the type on its own and you must tell it explicitly.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Type inferred: compiler sees the value and figures it out
    let x = 42;          // i32
    let y = 3.14;        // f64
    let z = true;        // bool

    // Type explicit: required when inference is ambiguous
    let parsed: u32 = "99".parse().expect("not a number");

    println!("{} {} {} {}", x, y, z, parsed);
}</code></pre>
</div>

<p>Without the <code>: u32</code> annotation on <code>parsed</code>, the compiler would complain that it does not know which numeric type to produce from <code>.parse()</code>. The annotation resolves the ambiguity.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using single quotes for a string and double quotes for a char</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: double quotes produce a &str, not a char
fn main() {
    let letter: char = "A"; // error: expected char, found &str
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: single quotes for char
fn main() {
    let letter: char = 'A'; // correct
}</code></pre>
</div>

<h3>Mistake 2: Using an integer as a boolean condition</h3>

<p>In C and Python, non-zero integers are "truthy". In Rust, the condition of <code>if</code> must be a <code>bool</code>. Integers are never implicitly converted.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: integer used as condition
fn main() {
    let x = 1;
    if x { // error: expected bool, found integer
        println!("truthy");
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: compare explicitly to produce a bool
fn main() {
    let x = 1;
    if x != 0 {
        println!("truthy");
    }
}</code></pre>
</div>

<h3>Mistake 3: Accessing an array out of bounds</h3>

<p>Unlike C, Rust checks array bounds at runtime in debug mode and will panic with a helpful message rather than reading garbage memory. But it is still a bug.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: index 5 is out of bounds for an array of length 3
fn main() {
    let arr = [10, 20, 30];
    println!("{}", arr[5]); // panic at runtime: index out of bounds
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: stay within bounds
fn main() {
    let arr = [10, 20, 30];
    println!("{}", arr[2]); // 30 — last valid index is length - 1
}</code></pre>
</div>

<h3>Mistake 4: Mixing integer types without explicit casting</h3>

<p>Rust never implicitly converts between numeric types. Even adding a <code>u8</code> to an <code>i32</code> requires a cast.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: cannot mix u8 and i32 directly
fn main() {
    let a: u8  = 10;
    let b: i32 = 20;
    let c = a + b; // error: mismatched types
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: cast explicitly with the "as" keyword
fn main() {
    let a: u8  = 10;
    let b: i32 = 20;
    let c = a as i32 + b; // 30 — a is widened to i32 before adding
    println!("{}", c);
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 7: Expressions vs Statements
     --------------------------------------------------------------- */
  'ch07': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 7,
    title: 'Expressions vs Statements',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 7</span>
</div>

<h1>Expressions vs Statements</h1>

<p>One of Rust's most important and initially surprising characteristics is that it is an <strong>expression-based language</strong>. In many languages you learned before Rust, there is a clear separation between code that <em>does</em> something and code that <em>produces</em> a value. In Rust, the boundary is more intentional and the consequences are more powerful. Understanding the difference between a statement and an expression will help you write cleaner, more idiomatic Rust from day one.</p>

<h2>The Analogy: Orders vs Questions</h2>

<p>Imagine two kinds of instructions you might give someone:</p>

<ul>
  <li>An <strong>order</strong>: "Go to the store." This is an instruction. It does something. It does not give you back a value. After you've gone to the store, you just say "done."</li>
  <li>A <strong>question</strong>: "What is 2 plus 2?" This evaluates to an answer. The answer, 4, is a value you can use for something else.</li>
</ul>

<p>In Rust, <strong>statements</strong> are orders: they perform an action and produce no value. <strong>Expressions</strong> are questions: they evaluate to a value that you can use, pass around, or assign to a variable.</p>

<h2>Statements</h2>

<p>A statement performs an action but does not return a value. The most common statements in Rust are:</p>

<dl>
  <dt>Variable declarations with <code>let</code></dt>
  <dd>Creating a new binding is a statement. It does something (allocates memory and binds a name), but the act of binding itself produces no value.</dd>
  <dt>Expressions followed by a semicolon</dt>
  <dd>Adding a semicolon to the end of an expression converts it into a statement. The value the expression would have produced is discarded.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;   // this is a statement (let binding)
    let y = 10;  // this is a statement (let binding)
    x + y;       // this is a statement (expression + semicolon, value discarded)
}</code></pre>
</div>

<p>In that last line, <code>x + y</code> calculates 15, then the semicolon discards the result. This compiles, but it is almost certainly not what you intended. The compiler will warn you about unused values like this.</p>

<h2>Expressions</h2>

<p>An expression evaluates to a value. In Rust, the following are all expressions:</p>

<ul>
  <li>Literal values: <code>5</code>, <code>true</code>, <code>3.14</code></li>
  <li>Arithmetic: <code>x + 1</code>, <code>a * b</code></li>
  <li>Function calls: <code>add(3, 4)</code></li>
  <li>Code blocks: <code>{ let x = 3; x + 1 }</code></li>
  <li>Control flow constructs: <code>if</code>, <code>loop</code>, <code>match</code></li>
</ul>

<p>The last two points are what makes Rust unusual. Code blocks and control flow are expressions in Rust. They evaluate to values. Most other languages treat them as statements only.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // 5 is an expression. Assigning it makes the let a statement.
    let a = 5;

    // x + 1 is an expression. Its value (6) is used in the let statement.
    let x = 5;
    let b = x + 1;

    println!("{} {}", a, b); // 5 6
}</code></pre>
</div>

<h2>The Semicolon Rule</h2>

<p>This is the single most important rule in this chapter, and it is one that trips up beginners constantly:</p>

<blockquote style="border-left:4px solid var(--accent);padding:0.75rem 1.25rem;background:var(--accent-dim);margin:1.25rem 0;border-radius:var(--radius);">
  <p style="margin:0;font-weight:600;color:var(--text-primary);">An expression does NOT end with a semicolon. If you add a semicolon, you turn it into a statement and the value is thrown away.</p>
</blockquote>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Without semicolon: this is an expression producing the value 4
    let result = {
        let x = 3;
        x + 1       // NO semicolon here — this is the value of the block
    };

    println!("result = {}", result); // 4
}</code></pre>
</div>

<pre class="output"><code>result = 4</code></pre>

<p>Now see what happens when you add a semicolon to the last line of the block:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let result = {
        let x = 3;
        x + 1;     // semicolon added: now a statement, value is discarded
                   // the block now returns () (unit), not 4
    };

    // result is now (), the unit type, which has no printable value
    println!("{:?}", result); // ()
}</code></pre>
</div>

<pre class="output"><code>()</code></pre>

<p>The block still runs, but the value is thrown away. The block returns <code>()</code>, the "unit" type you met in Chapter 6, which represents "nothing meaningful." This is a very common source of bugs for Rust newcomers.</p>

<h2>Block Expressions as Values</h2>

<p>Because a block surrounded by <code>{}</code> is an expression, you can use a block anywhere a value is expected. The block runs its statements, then evaluates its final expression (without a semicolon) and that becomes the block's value.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5u32;

    let y = {
        let squared = x * x;      // 25
        let cubed   = squared * x; // 125
        cubed + squared + x        // 125 + 25 + 5 = 155 (no semicolon)
    };

    println!("y = {}", y); // 155
}</code></pre>
</div>

<pre class="output"><code>y = 155</code></pre>

<p>This pattern is idiomatic Rust. Instead of writing a series of separate statements and keeping track of which variable holds the final result, you compute everything inside a block and let the block produce the value directly.</p>

<h2>If as an Expression</h2>

<p>In most languages, <code>if</code> is a statement. In Rust, <code>if</code> is an expression. It evaluates to a value, so you can use it on the right side of a <code>let</code> binding.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let temperature = 22;

    let description = if temperature > 30 {
        "hot"
    } else {
        "comfortable"
    };

    println!("It is {}", description);
}</code></pre>
</div>

<pre class="output"><code>It is comfortable</code></pre>

<p>Notice: there are no semicolons after <code>"hot"</code> and <code>"comfortable"</code>. They are the final expressions of each branch, so they become the value of the <code>if</code> expression. Also note that both branches produce values of the same type (<code>&amp;str</code> here). Rust requires this: the types on all branches of an <code>if</code> expression must match.</p>

<div class="callout">
  <div class="callout-label">This Replaces the Ternary Operator</div>
  <p>Languages like C, Java, and JavaScript have a ternary operator: <code>condition ? value_if_true : value_if_false</code>. Rust does not have this. Instead, you use <code>if</code> as an expression directly. The Rust version is more readable because it is just plain <code>if/else</code>.</p>
</div>

<h2>The Unit Type <code>()</code> Revisited</h2>

<p>You will see <code>()</code> a lot in Rust. Now you know what it means: it is the value produced by a statement, or by an expression whose value was discarded with a semicolon. Functions that do not explicitly return a value return <code>()</code>. Blocks that end with a semicoloned expression return <code>()</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn do_something() {
    // no explicit return value
    println!("doing something");
    // implicitly returns ()
}

fn main() {
    let result = do_something(); // result is ()
    println!("{:?}", result);    // ()
}</code></pre>
</div>

<pre class="output"><code>doing something
()</code></pre>

<h2>Why <code>let</code> Is NOT an Expression</h2>

<p>In C and Ruby, assignment returns the assigned value. This allows chained assignments like <code>a = b = 5</code>. Rust deliberately does not allow this. A <code>let</code> binding is a statement, not an expression, and it returns no value.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This is INVALID in Rust — let is a statement, not an expression
fn main() {
    let x = (let y = 6); // error: expected expression, found let statement
}</code></pre>
</div>

<p>This design prevents a common class of bugs in C where a programmer writes <code>if (x = 5)</code> when they meant <code>if (x == 5)</code>. In Rust, accidentally using an assignment where a value is expected simply does not compile.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Adding a semicolon to the final expression in a block meant to return a value</h3>

<p>This is the classic mistake. You intend a block to produce a value, but the semicolon discards it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: semicolon on last line means the block returns ()
fn main() {
    let value = {
        let x = 10;
        x * 2;  // semicolon discards 20, block returns ()
    };
    println!("{}", value); // error: () does not implement Display for {}
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: remove the semicolon on the last expression
fn main() {
    let value = {
        let x = 10;
        x * 2   // no semicolon: block evaluates to 20
    };
    println!("{}", value); // 20
}</code></pre>
</div>

<h3>Mistake 2: Mismatched types in if/else arms used as an expression</h3>

<p>When you use <code>if</code> as an expression, every branch must return the same type. Mixing types is a compile error.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: branches return different types
fn main() {
    let flag = true;
    let result = if flag { 1 } else { "one" }; // error: mismatched types
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: both branches return the same type
fn main() {
    let flag = true;
    let result = if flag { 1 } else { 0 }; // both are i32
    println!("{}", result); // 1
}</code></pre>
</div>

<h3>Mistake 3: Forgetting that if without else returns ()</h3>

<p>If you use <code>if</code> as an expression without an <code>else</code> branch, Rust must assume the <code>else</code> case returns <code>()</code>. If your <code>if</code> branch returns anything other than <code>()</code>, this is a compile error.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: if returns i32 but there's no else, so the implicit else returns ()
fn main() {
    let x = 5;
    let result = if x > 3 { 10 }; // error: mismatched types, expected (), found i32
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: add an else branch
fn main() {
    let x = 5;
    let result = if x > 3 { 10 } else { 0 };
    println!("{}", result); // 10
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 8: Control Flow (if, loop, while, for)
     --------------------------------------------------------------- */
  'ch08': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 8,
    title: 'Control Flow (if, loop, while, for)',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 8</span>
</div>

<h1>Control Flow</h1>

<p>A program that only executes lines in a straight sequence from top to bottom is severely limited. Almost every real program needs to make decisions, repeat actions, and skip over code based on conditions. The tools that let you do this are called <strong>control flow</strong> constructs. Rust provides three main ones: <code>if</code> for making decisions, and <code>loop</code>, <code>while</code>, and <code>for</code> for repeating work.</p>

<h2>The Analogy: A Choose-Your-Own-Adventure Book</h2>

<p>Think of control flow like a choose-your-own-adventure book. Every few pages, you hit a decision point: "If you entered the forest, go to page 47. Otherwise, go to page 23." That is an <code>if</code>. Sometimes there is a room you have to keep revisiting until you find the key: that is a <code>loop</code>. Some tasks repeat a fixed number of times, like climbing 10 stairs: that is a <code>for</code>.</p>

<h2>Making Decisions with <code>if</code></h2>

<p>The <code>if</code> expression runs a block of code only when a condition is true. The condition must be a <code>bool</code> (you learned in Chapter 6 that Rust does not allow integers to act as booleans).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let temperature = 28;

    if temperature > 30 {
        println!("It is hot outside.");
    } else {
        println!("It is comfortable outside.");
    }
}</code></pre>
</div>

<pre class="output"><code>It is comfortable outside.</code></pre>

<h3>Multiple Conditions with <code>else if</code></h3>

<p>Chain multiple conditions using <code>else if</code>. Rust checks each condition in order and runs the first block whose condition is true. All remaining branches are skipped, even if their conditions would also be true.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let score = 72;

    if score >= 90 {
        println!("Grade: A");
    } else if score >= 80 {
        println!("Grade: B");
    } else if score >= 70 {
        println!("Grade: C");
    } else {
        println!("Grade: F");
    }
}</code></pre>
</div>

<pre class="output"><code>Grade: C</code></pre>

<p>Even though <code>score >= 70</code> is true, the <code>score >= 80</code> condition is checked first. Since 72 is not greater than or equal to 80, that branch is skipped. The first true branch wins.</p>

<div class="callout">
  <div class="callout-label">Tip</div>
  <p>If you have more than two or three <code>else if</code> branches, consider using <code>match</code> instead. You will learn about <code>match</code> in Chapter 10 (Pattern Matching Basics). It is cleaner and more powerful for multi-way branching.</p>
</div>

<h3><code>if</code> as an Expression (Quick Reminder)</h3>

<p>As you saw in Chapter 7, <code>if</code> is an expression in Rust. You can use it directly in a <code>let</code> binding. Both branches must return the same type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let is_adult = true;
    let ticket_price = if is_adult { 12 } else { 6 };
    println!("Ticket price: {}", ticket_price);
}</code></pre>
</div>

<pre class="output"><code>Ticket: $12</code></pre>

<h2>Infinite Loops with <code>loop</code></h2>

<p>The <code>loop</code> keyword creates an infinite loop. It runs its body repeatedly until you explicitly tell it to stop using the <code>break</code> keyword. Think of it as "keep doing this until I say stop."</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut attempts = 0;

    loop {
        attempts += 1;
        println!("Attempt {}", attempts);

        if attempts == 3 {
            println!("Done after {} attempts.", attempts);
            break;
        }
    }
}</code></pre>
</div>

<pre class="output"><code>Attempt 1
Attempt 2
Attempt 3
Done after 3 attempts.</code></pre>

<h3>Returning a Value from <code>loop</code></h3>

<p>Remember that <code>loop</code> is also an expression. You can return a value from a loop by putting a value after <code>break</code>. This is useful for retry logic where you want to loop until you get a result and then use that result.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;
        if counter == 5 {
            break counter * 10; // returns 50 from the loop
        }
    };

    println!("Loop result: {}", result); // 50
}</code></pre>
</div>

<pre class="output"><code>Loop result: 50</code></pre>

<h3>Skipping Iterations with <code>continue</code></h3>

<p>The <code>continue</code> keyword skips the rest of the current iteration and immediately starts the next one. It is useful for filtering out items you do not want to process.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut n = 0;
    loop {
        n += 1;
        if n > 6 { break; }
        if n % 2 == 0 { continue; } // skip even numbers
        println!("{}", n);
    }
}</code></pre>
</div>

<pre class="output"><code>1
3
5</code></pre>

<h3>Loop Labels for Nested Loops</h3>

<p>When you nest one loop inside another, a plain <code>break</code> only exits the innermost loop. To exit an outer loop from inside an inner one, use a <strong>loop label</strong>. Labels are written with a single quote prefix, like <code>'outer</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut found = false;

    'search: loop {
        let mut inner = 0;
        loop {
            inner += 1;
            if inner == 3 {
                found = true;
                break 'search; // exits both loops at once
            }
        }
    }

    println!("Found: {}", found); // true
}</code></pre>
</div>

<pre class="output"><code>Found: true</code></pre>

<p>Without the <code>'search</code> label, <code>break</code> would only exit the inner loop and the outer <code>'search</code> loop would continue forever.</p>

<h2>Conditional Loops with <code>while</code></h2>

<p>The <code>while</code> loop runs its body as long as a condition remains true. It checks the condition before each iteration. When the condition becomes false, the loop stops.</p>

<p>Think of a <code>while</code> loop as: "Keep doing this while it is still true that..."</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut countdown = 5;

    while countdown > 0 {
        println!("{}!", countdown);
        countdown -= 1;
    }

    println!("Lift off!");
}</code></pre>
</div>

<pre class="output"><code>5!
4!
3!
2!
1!
Lift off!</code></pre>

<p>You could achieve the same thing with <code>loop { if ... { break; } }</code>, but <code>while</code> is cleaner when the exit condition is a simple expression that can be checked at the top of each iteration.</p>

<h2>Iterating with <code>for</code></h2>

<p>The <code>for</code> loop is Rust's most commonly used loop. It iterates over a sequence of values one by one. Unlike manually indexing into a collection with a <code>while</code> loop, <code>for</code> is safe (no out-of-bounds risk), concise, and expressive.</p>

<h3>Iterating Over a Collection</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let fruits = ["apple", "banana", "cherry"];

    for fruit in fruits {
        println!("I like {}", fruit);
    }
}</code></pre>
</div>

<pre class="output"><code>I like apple
I like banana
I like cherry</code></pre>

<p>The loop variable <code>fruit</code> takes the value of each element in turn. You do not need to track an index, check bounds, or manually advance a counter. Rust handles all of that.</p>

<h3>Iterating Over a Range</h3>

<p>Rust has range syntax for generating sequences of numbers. Two forms:</p>

<dl>
  <dt><code>1..5</code></dt>
  <dd>Exclusive end: produces 1, 2, 3, 4. Does NOT include 5.</dd>
  <dt><code>1..=5</code></dt>
  <dd>Inclusive end: produces 1, 2, 3, 4, 5. Includes 5.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Exclusive range: 1 to 4
    for i in 1..5 {
        print!("{} ", i);
    }
    println!();

    // Inclusive range: 1 to 5
    for i in 1..=5 {
        print!("{} ", i);
    }
    println!();
}</code></pre>
</div>

<pre class="output"><code>1 2 3 4
1 2 3 4 5 </code></pre>

<h3>Counting Down with <code>.rev()</code></h3>

<p>Call <code>.rev()</code> on a range to iterate in reverse order:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    for i in (1..=3).rev() {
        println!("{}...", i);
    }
    println!("Go!");
}</code></pre>
</div>

<pre class="output"><code>3...
2...
1...
Go!</code></pre>

<h3>Accessing the Index with <code>.enumerate()</code></h3>

<p>Sometimes you need both the index and the value. Use <code>.enumerate()</code> to get a tuple of <code>(index, value)</code> on each iteration.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let colors = ["red", "green", "blue"];

    for (i, color) in colors.iter().enumerate() {
        println!("Color {}: {}", i, color);
    }
}</code></pre>
</div>

<pre class="output"><code>Color 0: red
Color 1: green
Color 2: blue</code></pre>

<h2>Choosing the Right Loop</h2>

<dl>
  <dt><code>loop</code></dt>
  <dd>Use when you need to retry something until a condition is met and you need to return a value from the loop, or when the exit logic is complex and fits more naturally at the end or middle of the body.</dd>
  <dt><code>while</code></dt>
  <dd>Use when there is a simple condition to check at the start of each iteration and you do not need to return a value from the loop itself.</dd>
  <dt><code>for</code></dt>
  <dd>Use for almost everything else: iterating over collections, ranges, or any sequence. This is the most common loop in idiomatic Rust and the safest because it eliminates manual index management.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using an integer directly as an if condition</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: integer is not bool
fn main() {
    let x = 5;
    if x { // error: expected bool, found integer
        println!("nonzero");
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: compare explicitly
fn main() {
    let x = 5;
    if x != 0 {
        println!("nonzero");
    }
}</code></pre>
</div>

<h3>Mistake 2: Off-by-one error with exclusive ranges</h3>

<p>A very common mistake is forgetting that <code>1..5</code> produces 1, 2, 3, 4 and does NOT include 5. If you want to include 5, use <code>1..=5</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// UNINTENDED: trying to print 1 through 5, but 5 is missing
fn main() {
    for i in 1..5 {
        print!("{} ", i); // prints: 1 2 3 4
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: inclusive range
fn main() {
    for i in 1..=5 {
        print!("{} ", i); // prints: 1 2 3 4 5
    }
}</code></pre>
</div>

<h3>Mistake 3: Expecting break to exit an outer loop without a label</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: this break only exits the inner loop
fn main() {
    loop {
        loop {
            break; // exits the inner loop only
        }
        // we're still in the outer loop here — infinite loop!
        break; // need this to actually exit
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use a label to target the outer loop
fn main() {
    'outer: loop {
        loop {
            break 'outer; // exits the outer loop directly
        }
    }
    println!("Exited outer loop");
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 9: Functions
     --------------------------------------------------------------- */
  'ch09': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 9,
    title: 'Functions',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 9</span>
</div>

<h1>Functions</h1>

<p>Functions are the primary way to organize code in Rust. A function is a named, reusable block of code that takes some inputs, performs a task, and optionally produces an output. You have already been writing one: <code>main()</code> is a function, and it is the entry point of every Rust binary.</p>

<p>In this chapter you will learn how to define your own functions, how to pass data into them with parameters, and how to get data back out with return values. The concepts of expressions and statements from Chapter 7 become very concrete here: they directly control how return values work.</p>

<h2>The Analogy: A Recipe</h2>

<p>A function is like a cooking recipe. A recipe has a name ("Chocolate Cake"), a list of ingredients with specific quantities (the parameters: "2 eggs, 200g flour"), and a finished product it produces (the return value: "one cake"). You can follow the recipe as many times as you want, and each time you follow it exactly the same way.</p>

<p>Writing a function defines the recipe. Calling a function follows it.</p>

<h2>Defining a Function</h2>

<p>Use the <code>fn</code> keyword to define a function, followed by the function's name, a pair of parentheses, and a body wrapped in curly braces.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn greet() {
    println!("Hello from a function!");
}

fn main() {
    greet(); // calling the function
    greet(); // can call it multiple times
}</code></pre>
</div>

<pre class="output"><code>Hello from a function!
Hello from a function!</code></pre>

<p>A few things to notice:</p>
<ul>
  <li>Function names use <strong>snake_case</strong>: all lowercase, words separated by underscores. Writing <code>greetUser</code> (camelCase) is not idiomatic Rust.</li>
  <li>You can define functions before or after <code>main</code>. Rust does not require functions to be declared before they are called, unlike C.</li>
  <li>To call a function, write its name followed by parentheses.</li>
</ul>

<h2>Parameters: Passing Data In</h2>

<p>A function with no parameters is not very flexible. Parameters are the "ingredients" in your recipe: named slots where the caller provides specific values.</p>

<p><strong>In Rust, every parameter must have a type annotation.</strong> This is a deliberate rule. By requiring types in function signatures, Rust can almost always infer types inside function bodies without needing further annotations, keeping your code clean while remaining fully type-safe.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn greet_user(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    greet_user("Alice");
    greet_user("Bob");
}</code></pre>
</div>

<pre class="output"><code>Hello, Alice!
Hello, Bob!</code></pre>

<p>The parameter <code>name: &amp;str</code> means: "a parameter named <code>name</code> of type string slice". You will learn more about <code>&amp;str</code> in detail in later modules. For now, think of it as "a piece of text."</p>

<h3>Multiple Parameters</h3>

<p>Separate multiple parameters with commas. Each parameter gets its own name and type annotation.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn describe_player(name: &str, score: u32, active: bool) {
    println!("{}: score={}, active={}", name, score, active);
}

fn main() {
    describe_player("Alice", 2500, true);
    describe_player("Bob",   1800, false);
}</code></pre>
</div>

<pre class="output"><code>Alice: score=2500, active=true
Bob: score=1800, active=false</code></pre>

<h2>Return Values: Getting Data Out</h2>

<p>A function can produce a value that the caller can use. To do this, you declare a <strong>return type</strong> after an arrow (<code>-&gt;</code>) in the function signature.</p>

<p>The value a function returns is the last <strong>expression</strong> in its body, written without a semicolon. This is the expression-based rule from Chapter 7 in action.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn add(a: i32, b: i32) -> i32 {
    a + b  // no semicolon: this is the return value
}

fn main() {
    let result = add(10, 5);
    println!("10 + 5 = {}", result);
}</code></pre>
</div>

<pre class="output"><code>10 + 5 = 15</code></pre>

<p>The function <code>add</code> declares <code>-&gt; i32</code>: "I will return a 32-bit integer." The body contains one expression, <code>a + b</code>, with no semicolon. That expression is evaluated and its value is returned to the caller.</p>

<h3>A More Complex Return Example</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0
}

fn main() {
    let boiling = celsius_to_fahrenheit(100.0);
    let freezing = celsius_to_fahrenheit(0.0);
    println!("Boiling: {}°F", boiling);
    println!("Freezing: {}°F", freezing);
}</code></pre>
</div>

<pre class="output"><code>Boiling: 212°F
Freezing: 32°F</code></pre>

<h2>The Semicolon Rule Applied to Functions</h2>

<p>This is where the semicolon rule from Chapter 7 becomes critically important. If you accidentally add a semicolon to the last expression in a function body, you turn it into a statement. The function then returns <code>()</code> (unit) instead of the value you intended, and the compiler will tell you:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: semicolon causes the function to return ()
fn double(x: i32) -> i32 {
    x * 2; // error! this is now a statement, not a return expression
}</code></pre>
</div>

<pre class="output"><code>error[E0308]: mismatched types
 --> src/main.rs:2:22
  |
2 | fn double(x: i32) -> i32 {
  |                      ^^^ expected \`i32\`, found \`()\`
  |
  = help: remove this semicolon to return this value</code></pre>

<p>The compiler even tells you exactly what to do: remove the semicolon. This is one of the most helpful error messages in Rust.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: no semicolon on the return expression
fn double(x: i32) -> i32 {
    x * 2
}

fn main() {
    println!("{}", double(7)); // 14
}</code></pre>
</div>

<h2>Early Returns with the <code>return</code> Keyword</h2>

<p>The implicit tail expression is the idiomatic Rust way to return a value. But there are times when you need to exit a function early, before reaching the end of the body. For those cases, use the explicit <code>return</code> keyword.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn is_divisible(n: u32, divisor: u32) -> bool {
    if divisor == 0 {
        return false; // early return: guard against division by zero
    }
    n % divisor == 0 // tail expression for the normal case
}

fn main() {
    println!("{}", is_divisible(10, 2)); // true
    println!("{}", is_divisible(10, 3)); // false
    println!("{}", is_divisible(10, 0)); // false
}</code></pre>
</div>

<pre class="output"><code>true
false
false</code></pre>

<p>Using <code>return</code> for a guard clause at the top of a function is a clean, readable pattern. The normal logic flows naturally at the end, and edge cases are handled and dismissed early.</p>

<h2>Functions That Return Nothing</h2>

<p>A function that does not return a meaningful value implicitly returns <code>()</code>, the unit type. You do not need to write <code>-&gt; ()</code> in the signature: just omit the return type entirely.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn print_divider() {
    println!("---");
    // implicitly returns ()
}

fn main() {
    print_divider();
    println!("Section A");
    print_divider();
    println!("Section B");
    print_divider();
}</code></pre>
</div>

<pre class="output"><code>---
Section A
---
Section B
---</code></pre>

<h2>Functions Calling Other Functions</h2>

<p>Functions can call other functions freely. This is how you build programs from small, composable pieces.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn square(x: i32) -> i32 {
    x * x
}

fn sum_of_squares(a: i32, b: i32) -> i32 {
    square(a) + square(b) // calls another function
}

fn main() {
    println!("3² + 4² = {}", sum_of_squares(3, 4)); // 9 + 16 = 25
}</code></pre>
</div>

<pre class="output"><code>3² + 4² = 25</code></pre>

<h2>Putting It Together: A FizzBuzz Function</h2>

<p>Here is a practical example that uses everything from this chapter: parameters, return values, early returns, and multiple conditions.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn fizzbuzz(n: u32) -> &'static str {
    if n % 15 == 0 {
        return "FizzBuzz";
    } else if n % 3 == 0 {
        return "Fizz";
    } else if n % 5 == 0 {
        return "Buzz";
    }
    "number" // tail expression for numbers that don't match
}

fn main() {
    for i in 1..=15 {
        println!("{}: {}", i, fizzbuzz(i));
    }
}</code></pre>
</div>

<pre class="output"><code>1: number
2: number
3: Fizz
4: number
5: Buzz
6: Fizz
7: number
8: number
9: Fizz
10: Buzz
11: number
12: Fizz
13: number
14: number
15: FizzBuzz</code></pre>

<div class="callout">
  <div class="callout-label">Note on &amp;'static str</div>
  <p>The return type <code>&amp;'static str</code> means "a string slice that lives for the entire duration of the program." String literals in your source code are always <code>'static</code>. You will understand lifetimes in depth in Module 5. For now, use <code>&amp;'static str</code> when returning string literals from functions.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Missing a type annotation on a parameter</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: parameter x has no type annotation
fn double(x) -> i32 { // error: expected one of ':', ...
    x * 2
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: every parameter needs a type
fn double(x: i32) -> i32 {
    x * 2
}</code></pre>
</div>

<h3>Mistake 2: Using the wrong number of arguments when calling</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: add expects 2 arguments, called with 1
fn add(a: i32, b: i32) -> i32 { a + b }

fn main() {
    let result = add(5); // error: expected 2 arguments, found 1
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED
fn add(a: i32, b: i32) -> i32 { a + b }

fn main() {
    let result = add(5, 3);
    println!("{}", result); // 8
}</code></pre>
</div>

<h3>Mistake 3: Semicolon on the last expression of a function with a return type</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: semicolon discards the value, function returns ()
fn multiply(a: i32, b: i32) -> i32 {
    a * b; // error: expected i32, found ()
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: remove the semicolon
fn multiply(a: i32, b: i32) -> i32 {
    a * b
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 10: Pattern Matching Basics
     --------------------------------------------------------------- */
  'ch10': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 10,
    title: 'Pattern Matching Basics',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 10</span>
</div>

<h1>Pattern Matching Basics</h1>

<p>You have already seen how to make decisions with <code>if</code>/<code>else if</code>/<code>else</code> chains. But when a single value can take on many specific forms and each form requires different handling, chaining many <code>else if</code> blocks quickly becomes messy and hard to read. Rust's <code>match</code> expression is the clean, powerful alternative. It is one of the features Rust programmers love most.</p>

<h2>The Analogy: A Post Office Sorting Machine</h2>

<p>Imagine a machine at a post office that reads the postcode on each parcel and routes it to the correct truck. The machine checks each parcel against a list of rules one by one: "Is this 10001? Route to Truck A. Is this 90210? Route to Truck B. Anything else? Route to the overflow pile." That is exactly how <code>match</code> works: a value is tested against a list of <strong>patterns</strong>, the first pattern that matches wins, and the associated code runs.</p>

<h2>Basic match Syntax</h2>

<p>A <code>match</code> expression consists of the <code>match</code> keyword, a value to test, and a list of arms. Each arm has the form <code>pattern =&gt; code</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn day_name(day: u8) -> &'static str {
    match day {
        1 => "Monday",
        2 => "Tuesday",
        3 => "Wednesday",
        4 => "Thursday",
        5 => "Friday",
        6 => "Saturday",
        7 => "Sunday",
        _ => "Invalid day",
    }
}

fn main() {
    println!("{}", day_name(3)); // Wednesday
    println!("{}", day_name(9)); // Invalid day
}</code></pre>
</div>

<pre class="output"><code>Wednesday
Invalid day</code></pre>

<p>A few things to note about this syntax:</p>
<ul>
  <li>Arms are separated by commas (the trailing comma on the last arm is optional but conventional).</li>
  <li>The <code>_</code> pattern at the end is the <strong>catch-all</strong>: it matches anything not covered by the earlier arms.</li>
  <li>Patterns are tested <strong>in order from top to bottom</strong>. The first one that matches wins, and no others are tested.</li>
</ul>

<h2>Exhaustiveness: Every Case Must Be Covered</h2>

<p>Rust requires that a <code>match</code> expression cover every possible value of the type being matched. This is called <strong>exhaustiveness</strong>. If you forget a case, the compiler refuses to build your program and tells you exactly what you missed.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: missing the catch-all, not exhaustive
fn describe(n: i32) -> &'static str {
    match n {
        1 => "one",
        2 => "two",
        // error: patterns 0i32 and i32::MIN..=0i32 and 3i32..=i32::MAX not covered
    }
}</code></pre>
</div>

<p>The fix: add a catch-all arm. You have two choices depending on whether you need to use the unmatched value.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn describe(n: i32) -> &'static str {
    match n {
        1 => "one",
        2 => "two",
        _ => "something else", // _ discards the value
    }
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Why Exhaustiveness Matters</div>
  <p>Exhaustiveness is a safety guarantee. If you add a new variant to an enum later, every match on that enum in your codebase will immediately fail to compile until you handle the new case. This is how Rust ensures you never silently ignore an important new case.</p>
</div>

<h2>Multi-Pattern Arms with <code>|</code></h2>

<p>Use the pipe character <code>|</code> to match several values in a single arm, the same way an OR works in logic.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn classify_number(n: i32) -> &'static str {
    match n {
        2 | 3 | 5 | 7 | 11 | 13 => "small prime",
        0                        => "zero",
        1                        => "one",
        _                        => "other",
    }
}

fn main() {
    println!("{}", classify_number(5));   // small prime
    println!("{}", classify_number(9));   // other
    println!("{}", classify_number(0));   // zero
}</code></pre>
</div>

<pre class="output"><code>small prime
other
zero</code></pre>

<h2>Range Patterns</h2>

<p>You can match ranges of values using the inclusive range syntax <code>..=</code> that you learned in Chapter 8.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn letter_grade(score: u32) -> char {
    match score {
        90..=100 => 'A',
        80..=89  => 'B',
        70..=79  => 'C',
        60..=69  => 'D',
        0..=59   => 'F',
        _        => '?', // score > 100
    }
}

fn main() {
    println!("{}", letter_grade(92)); // A
    println!("{}", letter_grade(73)); // C
    println!("{}", letter_grade(55)); // F
}</code></pre>
</div>

<pre class="output"><code>A
C
F</code></pre>

<p>This is far cleaner than an equivalent chain of <code>else if score &gt;= 90 &amp;&amp; score &lt;= 100</code> conditions.</p>

<h2>Named Catch-All: Binding the Value</h2>

<p>Sometimes your catch-all arm needs to use the value it matched. Instead of <code>_</code>, use a variable name. The matched value gets bound to that name inside the arm.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn describe_roll(dice: u8) -> String {
    match dice {
        1 => String::from("critical fail"),
        20 => String::from("critical hit"),
        n => format!("rolled a {}", n), // 'n' captures the value
    }
}

fn main() {
    println!("{}", describe_roll(1));  // critical fail
    println!("{}", describe_roll(14)); // rolled a 14
    println!("{}", describe_roll(20)); // critical hit
}</code></pre>
</div>

<pre class="output"><code>critical fail
rolled a 14
critical hit</code></pre>

<h2>match as an Expression</h2>

<p>Like <code>if</code>, <code>match</code> is an expression in Rust: it evaluates to a value. This means you can use the result of a <code>match</code> directly in a <code>let</code> binding. Every arm must produce the same type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let http_status = 404;

    let message = match http_status {
        200 => "OK",
        301 | 302 => "Redirect",
        404 => "Not Found",
        500 => "Server Error",
        _   => "Unknown",
    };

    println!("Status {}: {}", http_status, message);
}</code></pre>
</div>

<pre class="output"><code>Status 404: Not Found</code></pre>

<h2>Multi-Line Arms with Blocks</h2>

<p>If a match arm needs to run more than one line of code, wrap it in curly braces. The final expression in the block (without a semicolon) becomes the arm's value.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let value = 7;

    let result = match value {
        1 => {
            println!("Got one");
            "one"
        }
        2..=5 => {
            println!("Got a small number");
            "small"
        }
        _ => "other",
    };

    println!("Result: {}", result);
}</code></pre>
</div>

<pre class="output"><code>Got a small number
Result: small</code></pre>

<h2>A First Look at Option with match</h2>

<p>In Rust, you will frequently encounter <code>Option&lt;T&gt;</code>, which represents a value that might or might not be present. It has two variants: <code>Some(value)</code> (there is a value) and <code>None</code> (there is no value). You will learn about <code>Option</code> in depth in Module 6. For now, here is how <code>match</code> handles it naturally:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn double_if_some(x: Option&lt;i32&gt;) -> Option&lt;i32&gt; {
    match x {
        Some(n) => Some(n * 2), // extract n from Some, compute, wrap back
        None    => None,        // pass None through unchanged
    }
}

fn main() {
    let a = double_if_some(Some(5));
    let b = double_if_some(None);

    println!("{:?}", a); // Some(10)
    println!("{:?}", b); // None
}</code></pre>
</div>

<pre class="output"><code>Some(10)
None</code></pre>

<p>The pattern <code>Some(n)</code> does two things at once: it checks that the value is <code>Some</code>, and it <strong>extracts</strong> the inner value into the variable <code>n</code>. This is called <em>destructuring</em> and is one of Rust's most expressive features. You will use it extensively.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Placing a named catch-all before specific patterns (unreachable code)</h3>

<p>Patterns are tested in order. If you put a named variable before specific patterns, it will match everything and the specific patterns below it will never be reached. Rust warns about this.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: the catch-all 'n' matches before 5 is checked
fn main() {
    let x = 5;
    match x {
        n => println!("got {}", n), // matches everything
        5 => println!("five"),      // warning: unreachable pattern
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: specific patterns come first, catch-all comes last
fn main() {
    let x = 5;
    match x {
        5 => println!("five"),
        n => println!("got {}", n),
    }
}</code></pre>
</div>

<h3>Mistake 2: Forgetting that match must be exhaustive</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: bool has two values; only one is handled
fn main() {
    let flag = true;
    let label = match flag {
        true => "yes",
        // error: non-exhaustive patterns, false not covered
    };
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: both possible values covered
fn main() {
    let flag = true;
    let label = match flag {
        true  => "yes",
        false => "no",
    };
    println!("{}", label); // yes
}</code></pre>
</div>

<h3>Mistake 3: Mismatched types across match arms used as an expression</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: arms return different types
fn main() {
    let n = 2;
    let result = match n {
        1 => "one",   // &str
        _ => 99,      // i32 — error: mismatched types
    };
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: all arms return the same type
fn main() {
    let n = 2;
    let result = match n {
        1 => "one",
        2 => "two",
        _ => "other",
    };
    println!("{}", result); // two
}</code></pre>
</div>
`
  },


  /* ---------------------------------------------------------------
     Chapter 11: Basic Input/Output
     --------------------------------------------------------------- */
  'ch11': {
    moduleNum: 2,
    moduleTitle: 'Core Language Basics',
    chNum: 11,
    title: 'Basic Input/Output',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 2 &mdash; Chapter 11</span>
</div>

<h1>Basic Input/Output</h1>

<p>Every useful program communicates with the outside world: it prints results, reads data from the user, or writes to files. In this chapter you will learn Rust's tools for the most fundamental kind of I/O: printing text to the terminal and reading text the user types in. These are the two operations you will use constantly when experimenting, debugging, and building command-line programs.</p>

<h2>Printing Output</h2>

<p>You have been using <code>println!</code> since Chapter 4. It is time to properly understand what it can do.</p>

<p>Rust provides a family of print macros. They all work similarly but differ in where they send their output and whether they include a newline at the end:</p>

<dl>
  <dt><code>println!()</code></dt>
  <dd>Prints to standard output with a newline at the end. The most common one.</dd>
  <dt><code>print!()</code></dt>
  <dd>Prints to standard output with no newline. Useful when you want multiple items on the same line.</dd>
  <dt><code>eprintln!()</code></dt>
  <dd>Prints to standard error with a newline. Use this for error messages and diagnostics so they can be separated from normal output.</dd>
  <dt><code>eprint!()</code></dt>
  <dd>Prints to standard error with no newline.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    print!("Hello ");     // no newline
    print!("there");      // still same line
    println!("!");        // newline after this

    eprintln!("This goes to stderr, not stdout");
}</code></pre>
</div>

<pre class="output"><code>Hello there!
This goes to stderr, not stdout</code></pre>

<h2>Format Strings</h2>

<p>The real power of the print macros is in their format strings. A format string is a piece of text with placeholders inside it. Rust fills in the placeholders with the values you provide as arguments.</p>

<h3>The <code>{}</code> Placeholder (Display)</h3>

<p>The simplest placeholder is <code>{}</code>. Rust replaces each <code>{}</code> in order with the corresponding argument after the format string.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let name = "Alice";
    let age = 30;
    let height = 1.72;

    println!("Name: {}, Age: {}, Height: {}m", name, age, height);
}</code></pre>
</div>

<pre class="output"><code>Name: Alice, Age: 30, Height: 1.72m</code></pre>

<h3>Inline Variable Names (Rust 2021)</h3>

<p>Since the 2021 edition, you can put a variable name directly inside the braces. This is often cleaner than listing variables after the format string.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let city = "London";
    let population = 9_000_000;
    println!("{city} has a population of about {population}.");
}</code></pre>
</div>

<pre class="output"><code>London has a population of about 9000000.</code></pre>

<h3>The <code>{:?}</code> Placeholder (Debug)</h3>

<p>The <code>{}</code> format is for displaying values to end users. The <code>{:?}</code> format is for <strong>debugging</strong>: it produces a machine-readable representation of the value. Most Rust types support debug formatting even when they do not support display formatting. This is invaluable while developing.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = [1, 2, 3, 4, 5];
    let flag = true;

    println!("{:?}", numbers);  // debug format
    println!("{:?}", flag);     // debug format
    println!("{}", flag);       // display format
}</code></pre>
</div>

<pre class="output"><code>[1, 2, 3, 4, 5]
true
true</code></pre>

<p>For complex nested structures, use <code>{:#?}</code> (pretty-print debug) which adds indentation:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let matrix = [[1, 2, 3], [4, 5, 6]];
    println!("{:#?}", matrix);
}</code></pre>
</div>

<pre class="output"><code>[
    [
        1,
        2,
        3,
    ],
    [
        4,
        5,
        6,
    ],
]</code></pre>

<h3>Numeric Formatting</h3>

<p>You can format numbers in different bases and control padding and alignment:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let n = 255;
    println!("Decimal: {}", n);       // 255
    println!("Binary:  {:b}", n);     // 11111111
    println!("Octal:   {:o}", n);     // 377
    println!("Hex:     {:x}", n);     // ff
    println!("Hex(UP): {:X}", n);     // FF

    // Padding: right-align in a field of width 8
    println!("{:>8}", 42);  // "      42"

    // Zero-pad to width 6
    println!("{:0>6}", 42); // "000042"
}</code></pre>
</div>

<pre class="output"><code>Decimal: 255
Binary:  11111111
Octal:   377
Hex:     ff
Hex(UP): FF
      42
000042</code></pre>

<h2>The <code>format!</code> Macro</h2>

<p>Sometimes you want to build a formatted string without printing it immediately. The <code>format!</code> macro works exactly like <code>println!</code> but returns a <code>String</code> instead of printing it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn build_greeting(name: &str, score: u32) -> String {
    format!("Hello, {}! Your score is {}.", name, score)
}

fn main() {
    let message = build_greeting("Bob", 95);
    println!("{}", message);
}</code></pre>
</div>

<pre class="output"><code>Hello, Bob! Your score is 95.</code></pre>

<h2>Reading Input from the Terminal</h2>

<p>Reading user input in Rust is a bit more involved than printing, but the pattern is always the same five steps. Learn this pattern and you can handle any terminal input.</p>

<h3>Step 1: Bring stdin into scope</h3>

<p>Rust's I/O functions live in the <code>std::io</code> module. You bring them into scope with a <code>use</code> statement at the top of the file:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::io;</code></pre>
</div>

<h3>Step 2: Create a mutable String buffer</h3>

<p>User input will be stored in a <code>String</code>. You must declare it as <code>mut</code> because <code>read_line</code> needs to write into it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let mut input = String::new();</code></pre>
</div>

<h3>Step 3: Call read_line</h3>

<p><code>io::stdin().read_line(&amp;mut input)</code> reads a line from the terminal and appends it to your <code>String</code>. It returns a <code>Result</code> indicating success or failure. For now, call <code>.expect()</code> on it to handle errors simply: if reading fails, the program panics with your message.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">io::stdin().read_line(&mut input).expect("Failed to read input");</code></pre>
</div>

<h3>Step 4: Trim the newline</h3>

<p>When the user presses Enter, a newline character (<code>\\n</code>) is added to the end of the input. Most of the time you do not want this. Call <code>.trim()</code> to strip it, along with any leading or trailing spaces:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let input = input.trim(); // shadows the original with a trimmed version</code></pre>
</div>

<h3>Step 5: Parse if needed</h3>

<p>If the user typed a number, you need to convert the text to a numeric type. Use <code>.parse()</code> with a type annotation:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">let number: u32 = input.parse().expect("Please type a number");</code></pre>
</div>

<h2>Putting It Together: A Simple Echo Program</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::io;

fn main() {
    print!("Enter your name: ");

    let mut name = String::new();
    io::stdin().read_line(&mut name).expect("Failed to read");

    let name = name.trim(); // remove the newline
    println!("Hello, {}!", name);
}</code></pre>
</div>

<pre class="output"><code>Enter your name: Alice
Hello, Alice!</code></pre>

<h2>Putting It Together: A Number Doubler</h2>

<p>Here is a program that reads a number from the user and prints double its value. This example covers the full flow: prompt, read, trim, parse, compute, print.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::io;

fn main() {
    println!("Enter a number to double:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read input");

    let number: i64 = input.trim().parse().expect("That was not a number");
    let doubled = number * 2;

    println!("{} doubled is {}", number, doubled);
}</code></pre>
</div>

<pre class="output"><code>Enter a number to double:
7
7 doubled is 14</code></pre>

<h2>Handling Bad Input Gracefully</h2>

<p>Using <code>.expect()</code> is convenient but causes your program to crash if the user types something that is not a number. A more robust approach uses <code>match</code> on the <code>Result</code> returned by <code>.parse()</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::io;

fn main() {
    println!("Enter a number:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read");

    match input.trim().parse::<i32>() {
        Ok(n)  => println!("You entered: {}", n),
        Err(_) => println!("That was not a valid number."),
    }
}</code></pre>
</div>

<p>When parsing succeeds, the <code>Ok(n)</code> arm extracts the parsed number into <code>n</code>. When parsing fails, <code>Err(_)</code> catches the error (the <code>_</code> discards the error details) and prints a friendly message instead of crashing.</p>

<div class="callout">
  <div class="callout-label">Note on print! and flushing</div>
  <p>When you use <code>print!</code> (without a newline) for a prompt and then immediately read input, the prompt may not appear before the input is read. This is because terminal output is often line-buffered. To guarantee the prompt appears, use <code>println!</code> or explicitly flush stdout with <code>std::io::Write::flush(&amp;mut std::io::stdout()).unwrap()</code>. In most practical programs, using <code>println!</code> for prompts is the simpler solution.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting to declare the input buffer as mut</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: read_line needs a mutable reference
use std::io;
fn main() {
    let input = String::new(); // not mut
    io::stdin().read_line(&mut input).expect("fail");
    // error: cannot borrow \`input\` as mutable, as it is not declared as mutable
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: add mut
use std::io;
fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("fail");
}</code></pre>
</div>

<h3>Mistake 2: Forgetting to trim before parsing</h3>

<p>User input always ends with a newline character. Parsing "42\\n" as a number will fail.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: the newline character causes parse to fail
use std::io;
fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("fail");
    let n: i32 = input.parse().expect("not a number"); // panic! "42\\n" is not a number
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: trim first, then parse
use std::io;
fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("fail");
    let n: i32 = input.trim().parse().expect("not a number");
    println!("Got: {}", n);
}</code></pre>
</div>

<h3>Mistake 3: Using {} to print a type that only implements Debug</h3>

<p>Not all types implement the Display trait required by <code>{}</code>. Arrays, for instance, must be printed with <code>{:?}</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: arrays don't implement Display
fn main() {
    let arr = [1, 2, 3];
    println!("{}", arr); // error: \`[i32; 3]\` doesn't implement \`Display\`
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use debug format
fn main() {
    let arr = [1, 2, 3];
    println!("{:?}", arr);  // [1, 2, 3]
    println!("{:#?}", arr); // pretty-printed
}</code></pre>
</div>
`
  },

});
