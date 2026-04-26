/* ================================================================
   Module 5: Lifetimes & Memory Safety
   Chapters: 27 - 32  (this file covers ch27–ch32, all complete)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 27: Lifetime Annotations
     --------------------------------------------------------------- */
  'ch27': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes & Memory Safety',
    chNum: 27,
    title: 'Lifetime Annotations',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 27</span>
</div>

<h1>Lifetime Annotations</h1>

<p>Every reference in Rust has a <strong>lifetime</strong>: the span of code during which that reference is valid. Most of the time the Rust compiler figures this out on its own through inference, and you never think about it. But sometimes you write a function that takes multiple references and returns one of them, and the compiler cannot determine on its own how long the returned reference will live. In these cases, you must provide a <strong>lifetime annotation</strong> that explicitly describes the relationship between the input and output lifetimes.</p>

<p>Understanding lifetimes is what separates intermediate Rust from advanced Rust. Once you see what lifetime annotations actually mean, they stop looking like syntax noise and start looking like documentation about your code's safety guarantees.</p>

<h2>The Expiry Date Analogy</h2>

<p>Imagine you work in a kitchen that borrows ingredients from two different suppliers. Each batch of ingredients has an expiry date stamped on it. When you combine two batches into a new dish, the dish's expiry date is the earlier of the two. If one batch expires tomorrow and the other expires next week, the dish expires tomorrow. You are not changing how long either batch lasts; you are just labelling the result correctly so nobody serves expired food.</p>

<p>Rust lifetime annotations work exactly the same way. A reference has an inherent expiry based on when the value it points to gets dropped. Annotations do not change when values are dropped. They are labels that tell the compiler: the output's expiry is tied to these inputs. At each call site, the compiler substitutes the concrete lifetime, which is the earlier (shorter) of all the input lifetimes tied together.</p>

<h2>The Borrow Checker Already Tracks Lifetimes</h2>

<p>The borrow checker has been silently checking lifetimes in every chapter of this course. Here is a simple case where it rejects dangling reference code, using its lifetime knowledge:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let r;
    {
        let x = 5;
        r = &amp;x;  // r borrows x, whose lifetime is the inner block
    }            // x is dropped here — r would now point to freed memory

    println!("{}", r); // error: x does not live long enough
}</code></pre>
</div>

<p>The compiler sees that <code>x</code>'s lifetime (the inner block) is shorter than <code>r</code>'s lifetime (the outer scope). The reference in <code>r</code> would outlive its referent. This is a lifetime mismatch and Rust rejects it. No annotations were needed here because the lifetimes were obvious from the code structure. The problem arises when lifetimes are not obvious.</p>

<h2>The Problem: When the Compiler Cannot Infer Lifetimes</h2>

<p>Consider a function that returns whichever of two string slices is longer. The function wants to return one of its two input references, but which one depends on the runtime values. The compiler cannot figure out on its own how long the returned reference will live:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn longest(x: &amp;str, y: &amp;str) -&gt; &amp;str {
    if x.len() &gt; y.len() {
        x
    } else {
        y
    }
}
// error[E0106]: missing lifetime specifier
// The compiler cannot determine whether the return refers to x or y.</code></pre>
</div>

<p>The compiler is not being overly strict here. It genuinely does not know whether the returned reference comes from <code>x</code> or <code>y</code>, and those two references might have very different lifetimes in the caller. Without knowing which input the return refers to, the compiler cannot check whether the caller uses the return value safely.</p>

<h2>Lifetime Annotation Syntax</h2>

<p>Lifetime parameters start with an apostrophe followed by a short lowercase name. The convention is to start with <code>'a</code>, then <code>'b</code>, and so on. They appear inside angle brackets after the function name, just like generic type parameters:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Reading these type signatures:
// &amp;i32         -- a reference with an inferred lifetime
// &amp;'a i32      -- a reference with explicit lifetime 'a
// &amp;'a mut i32  -- a mutable reference with explicit lifetime 'a

// Functions declare lifetimes in angle brackets, just like type parameters:
// fn foo&lt;'a&gt;(x: &amp;'a str) -&gt; &amp;'a str   -- 'a is a generic lifetime parameter</code></pre>
</div>

<h2>Fixing the longest Function With a Lifetime Annotation</h2>

<p>By adding a generic lifetime parameter <code>'a</code> and using it on all three references (both inputs and the output), we tell the compiler: the returned reference lives for at most as long as both inputs are valid:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("long string");
    let s2 = String::from("xy");

    // The compiler substitutes 'a with the shorter of s1's and s2's lifetimes.
    let result = longest(s1.as_str(), s2.as_str());
    println!("Longest: {}", result); // long string
}</code></pre>
</div>

<pre class="output"><code>Longest: long string</code></pre>

<div class="callout">
  <div class="callout-label">What the Annotation Means — and Does Not Mean</div>
  <p>The annotation <code>'a</code> says: "at the call site, substitute <code>'a</code> with the concrete overlap where both <code>x</code> and <code>y</code> are valid — the shorter of the two." It does <strong>not</strong> extend or shorten either lifetime. Values still live exactly as long as they would without any annotation. The annotation is purely a constraint declaration for the borrow checker to verify against.</p>
</div>

<h2>Valid Usage: Both Strings Live Long Enough</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string is long");
    {
        let string2 = String::from("xyz");
        // Both string1 and string2 are alive in this block.
        // 'a gets the shorter lifetime (string2's scope).
        // result is used before string2 drops — safe.
        let result = longest(string1.as_str(), string2.as_str());
        println!("Longest: {}", result);
    } // string2 and result both drop here — everything is fine
}</code></pre>
</div>

<pre class="output"><code>Longest: long string is long</code></pre>

<h2>Invalid Usage: Shorter-Lived String Dies Before the Result Is Used</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    } // string2 is dropped here

    // result's lifetime is tied to string2 (the shorter input).
    // But string2 is gone — result could be a dangling reference.
    println!("Longest: {}", result); // error: string2 does not live long enough
}</code></pre>
</div>

<p>The borrow checker knows that <code>'a</code> was substituted with the overlap of <code>string1</code> and <code>string2</code>, which is <code>string2</code>'s shorter scope. Since <code>result</code> is used after <code>string2</code>'s scope ends, the borrow checker rejects it. The annotation made the relationship visible; now the borrow checker can verify it.</p>

<h2>Not Every Parameter Needs the Same Lifetime</h2>

<p>If a function always returns its first parameter and never uses the second for output, the second parameter's lifetime is irrelevant to the return type. You can use two separate lifetime parameters:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// x's lifetime 'a affects the return; y's lifetime 'b does not.
fn print_and_return&lt;'a, 'b&gt;(x: &amp;'a str, y: &amp;'b str) -&gt; &amp;'a str {
    println!("also received: {}", y);
    x  // only x is returned, so only 'a matters for the output
}

fn main() {
    let s1 = String::from("hello");
    let result;
    {
        let s2 = String::from("world");
        // s2 has a shorter lifetime, but since only x is returned,
        // that does not constrain result.
        result = print_and_return(s1.as_str(), s2.as_str());
    } // s2 drops — fine because result depends on s1's lifetime, not s2's
    println!("{}", result); // hello
}</code></pre>
</div>

<pre class="output"><code>also received: world
hello</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Believing a Lifetime Annotation Can Save a Local Variable from Being Dropped</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: no annotation can make a local outlive its function
fn make_str&lt;'a&gt;() -&gt; &amp;'a str {
    let local = String::from("local data");
    local.as_str()  // error: local is dropped at end of function
                    // Annotating 'a cannot change that.
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return an owned value when data is created locally
fn make_str() -&gt; String {
    String::from("local data") // ownership transfers to the caller
}

fn main() {
    let s = make_str();
    println!("{}", s);
}</code></pre>
</div>

<h3>Mistake 2: Using 'static to Silence a Lifetime Error</h3>

<p>Beginners sometimes add <code>'static</code> to every lifetime to make errors go away. This almost always hides the real bug and makes APIs unnecessarily restrictive. A <code>'static</code> lifetime means the reference must be valid for the entire program, which heap-allocated runtime data cannot satisfy.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// OVERLY RESTRICTIVE: forces y to be a string literal
fn first&lt;'a&gt;(x: &amp;'a str, _y: &amp;'static str) -&gt; &amp;'a str { x }

// CORRECT: y's lifetime is independent and not 'static
fn first_better&lt;'a, 'b&gt;(x: &amp;'a str, _y: &amp;'b str) -&gt; &amp;'a str { x }</code></pre>
</div>

<h3>Mistake 3: Annotating a Return Lifetime That Cannot Be Satisfied</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: annotation claims 'a but the value returned is local
fn wrong&lt;'a&gt;(x: &amp;'a str) -&gt; &amp;'a str {
    let temp = format!("{} extra", x); // new String on heap
    &amp;temp  // error: temp is dropped at end of function
}

// FIXED: return owned data if you need to create new content
fn correct(x: &amp;str) -&gt; String {
    format!("{} extra", x)
}

fn main() {
    let s = correct("hello");
    println!("{}", s); // hello extra
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 28: Lifetime Elision Rules
     --------------------------------------------------------------- */
  'ch28': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes & Memory Safety',
    chNum: 28,
    title: 'Lifetime Elision Rules',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 28</span>
</div>

<h1>Lifetime Elision Rules</h1>

<p>In Chapter 27, you added <code>'a</code> annotations to the <code>longest</code> function because the compiler could not infer which input lifetime the output depends on. But back in Chapter 24, you wrote <code>fn first_word(s: &amp;str) -&gt; &amp;str</code> with no annotations at all and it compiled fine. Why does one function need annotations and the other does not?</p>

<p>Early versions of Rust required explicit lifetime annotations on every reference in every function signature. This was extremely verbose. The team identified a small set of patterns that covered the vast majority of real-world code and encoded them as three inference rules called <strong>lifetime elision rules</strong>. When these rules can uniquely determine all lifetimes, you can omit annotations entirely. When they cannot, the compiler asks you to annotate explicitly.</p>

<h2>The Smart Auto-Fill Analogy</h2>

<p>Think of filling out a web form with multiple address fields. If you have only entered one address in the form, a smart auto-fill system knows that all address-related fields must refer to that one address. It fills them in for you. But if you have entered two different addresses (say, billing and shipping), it cannot auto-fill the delivery destination field, because it is ambiguous which address you mean. You must select one explicitly.</p>

<p>Lifetime elision works the same way. If the lifetime relationships are obvious from the structure of the function signature, the compiler fills them in. If they are ambiguous, the compiler stops and asks you to annotate explicitly.</p>

<h2>Input Lifetimes and Output Lifetimes</h2>

<dl>
  <dt>Input lifetime</dt>
  <dd>A lifetime on a reference in a function's parameter list.</dd>
  <dt>Output lifetime</dt>
  <dd>A lifetime on a reference in a function's return type.</dd>
</dl>

<p>The elision rules work in sequence: the compiler applies Rule 1, then Rule 2, then Rule 3. If all output lifetimes are assigned after these three passes, elision succeeds. If any output lifetime is still unassigned after Rule 3, the compiler requires explicit annotations.</p>

<h2>Rule 1: Each Input Reference Gets Its Own Lifetime</h2>

<p>Every reference parameter that omits a lifetime annotation is given its own distinct lifetime parameter. This rule assigns names internally; it does not help resolve output lifetimes on its own, but it sets up Rules 2 and 3.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// What you write:
fn print_val(x: &amp;i32) { println!("{}", x); }
fn add_refs(x: &amp;i32, y: &amp;i32) -&gt; i32 { x + y }

// What Rule 1 makes the compiler see internally:
fn print_val&lt;'a&gt;(x: &amp;'a i32) { println!("{}", x); }
fn add_refs&lt;'a, 'b&gt;(x: &amp;'a i32, y: &amp;'b i32) -&gt; i32 { x + y }</code></pre>
</div>

<p>For <code>print_val</code> and <code>add_refs</code>, the return type has no reference, so there is no output lifetime to assign. The rules finish here. No annotation needed.</p>

<h2>Rule 2: One Input Lifetime Propagates to All Outputs</h2>

<p>If after Rule 1 there is exactly one distinct input lifetime (one reference parameter), that lifetime is automatically assigned to all output lifetime positions. This is the most commonly triggered rule:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// What you write (from Chapter 24):
fn first_word(s: &amp;str) -&gt; &amp;str {
    let bytes = s.as_bytes();
    for (i, &amp;byte) in bytes.iter().enumerate() {
        if byte == b' ' { return &amp;s[0..i]; }
    }
    &amp;s[..]
}

// Step 1 — Rule 1 assigns lifetime 'a to s:
//   fn first_word&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;str

// Step 2 — Rule 2: exactly one input lifetime, assign to output:
//   fn first_word&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;'a str
//
// Elision succeeds. You wrote no annotations, but the compiler
// treats the function as if it had the explicit version above.</code></pre>
</div>

<p>Because <code>first_word</code> has exactly one input reference, Rule 2 unambiguously connects the output lifetime to it. No annotation needed. This is why you have been writing functions like this since Chapter 24 with no lifetime syntax at all.</p>

<h2>Rule 3: &amp;self Methods — Self's Lifetime Goes to the Output</h2>

<p>If one of the input parameters is <code>&amp;self</code> or <code>&amp;mut self</code>, the lifetime of <code>self</code> is assigned to all unresolved output lifetimes. Most struct methods return references to fields inside <code>self</code>, so Rule 3 covers them automatically:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Config {
    host: String,
    port: u16,
}

impl Config {
    // What you write:
    fn host(&amp;self) -&gt; &amp;str {
        &amp;self.host
    }

    // Rule 1: self gets 'a, no other reference params.
    // Rule 2: does NOT apply — &amp;self counts, but there are
    //         no additional output-specific rules from one input.
    // Rule 3: &amp;self is present; its lifetime 'a goes to output.
    // Final form seen by compiler:
    //   fn host&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a str { &amp;self.host }

    fn describe(&amp;self) -&gt; &amp;str {
        &amp;self.host  // Rule 3 handles this too
    }
}

fn main() {
    let cfg = Config { host: String::from("localhost"), port: 8080 };
    println!("host: {}", cfg.host());
    println!("desc: {}", cfg.describe());
}</code></pre>
</div>

<pre class="output"><code>host: localhost
desc: localhost</code></pre>

<h2>When Elision Fails: Two Inputs With an Output Reference</h2>

<p>If after all three rules there are still output lifetimes without an assignment, elision fails and the compiler requires explicit annotations. The classic failure case is a function with two input references and one output reference, with no <code>self</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile without annotations.
//
// After Rule 1: x gets 'a, y gets 'b. Two input lifetimes.
// After Rule 2: does NOT apply — two input lifetimes, not one.
// After Rule 3: does NOT apply — no &amp;self.
// Output lifetime still unassigned. Compiler asks for annotation.
fn pick(x: &amp;str, y: &amp;str) -&gt; &amp;str {
    if x.len() &gt; 0 { x } else { y }
}

// FIXED: explicitly tie the output to both inputs
fn pick&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; 0 { x } else { y }
}

fn main() {
    let a = String::from("first");
    let b = String::from("second");
    println!("{}", pick(&amp;a, &amp;b)); // first
}</code></pre>
</div>

<pre class="output"><code>first</code></pre>

<h2>Elided vs Explicit Forms Side By Side</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// These pairs are equivalent. The compiler sees the explicit form
// even when you write the elided form.

// Single input reference, output: Rule 2 applies.
fn pass_through(s: &amp;str) -&gt; &amp;str { s }
// Explicit: fn pass_through&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;'a str { s }

// Method returning self field: Rule 3 applies.
struct Wrapper(String);
impl Wrapper {
    fn inner(&amp;self) -&gt; &amp;str { &amp;self.0 }
    // Explicit: fn inner&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a str { &amp;self.0 }
}

// No output reference: no elision needed regardless of input count.
fn log(a: &amp;str, b: &amp;str) { println!("{} {}", a, b); }
// Explicit: fn log&lt;'a, 'b&gt;(a: &amp;'a str, b: &amp;'b str) { ... }</code></pre>
</div>

<h2>Method With &amp;self and Another Reference Input</h2>

<p>When a method has both <code>&amp;self</code> and another reference parameter, Rule 3 still applies — the output gets <code>self</code>'s lifetime. But if the output should depend on the <em>other</em> parameter instead, you must annotate explicitly:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Announcer {
    prefix: String,
}

impl Announcer {
    // Rule 3 applies: output gets self's lifetime.
    // Works because we return a slice of self.prefix.
    fn announce(&amp;self, _msg: &amp;str) -&gt; &amp;str {
        &amp;self.prefix
    }

    // If we want to return the incoming message instead,
    // we must annotate explicitly (output depends on msg, not self).
    fn echo&lt;'a&gt;(&amp;self, msg: &amp;'a str) -&gt; &amp;'a str {
        msg
    }
}

fn main() {
    let a = Announcer { prefix: String::from("[INFO]") };
    println!("{}", a.announce("hello"));       // [INFO]
    println!("{}", a.echo("custom message")); // custom message
}</code></pre>
</div>

<pre class="output"><code>[INFO]
custom message</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Expecting Elision to Work With Two Input References</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: two reference inputs block Rule 2; no &amp;self blocks Rule 3.
fn select(a: &amp;str, b: &amp;str) -&gt; &amp;str {
    if a.is_empty() { b } else { a }
}
// error: missing lifetime specifier</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: add explicit lifetime tying both inputs to the output
fn select&lt;'a&gt;(a: &amp;'a str, b: &amp;'a str) -&gt; &amp;'a str {
    if a.is_empty() { b } else { a }
}

fn main() {
    let x = String::from("hello");
    let y = String::from("fallback");
    println!("{}", select(&amp;x, &amp;y)); // hello
    println!("{}", select("", &amp;y));  // fallback
}</code></pre>
</div>

<h3>Mistake 2: Adding Unnecessary Annotations to Simple Methods</h3>

<p>When Rule 3 applies (output comes from self), no annotation is needed. Adding explicit annotations makes the code noisier without benefit:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Name(String);

// UNNECESSARY: Rule 3 handles this automatically
impl Name {
    fn get&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a str { &amp;self.0 }
}

// IDIOMATIC: let elision do its job
impl Name {
    fn get(&amp;self) -&gt; &amp;str { &amp;self.0 }
}</code></pre>
</div>

<h3>Mistake 3: Misreading Rule 2 as Applying to Any Single Reference</h3>

<p>Rule 2 requires exactly one input lifetime position <em>total</em>. A function with one reference parameter and a non-reference parameter still has only one input lifetime — so Rule 2 applies. But a non-reference parameter does not count as a lifetime position at all:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Rule 2 applies here: only one reference input (s).
// n: usize is not a reference and contributes no lifetime.
fn take_n(s: &amp;str, n: usize) -&gt; &amp;str {
    let end = s.len().min(n);
    &amp;s[..end]
}

// Rule 2 does NOT apply here: two reference inputs.
// Must annotate.
fn take_n_or_other&lt;'a&gt;(s: &amp;'a str, other: &amp;'a str, n: usize) -&gt; &amp;'a str {
    if n &lt; s.len() { s } else { other }
}

fn main() {
    let s = String::from("hello world");
    println!("{}", take_n(&amp;s, 5));              // hello
    println!("{}", take_n_or_other(&amp;s, "!", 5)); // hello world
}</code></pre>
</div>

<pre class="output"><code>hello
hello world</code></pre>
`
  },

  /* ---------------------------------------------------------------
     Chapter 29: Lifetimes in Structs
     --------------------------------------------------------------- */
  'ch29': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes &amp; Memory Safety',
    chNum: 29,
    title: 'Lifetimes in Structs',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 29</span>
</div>

<h1>Lifetimes in Structs</h1>

<p>Every struct you have built so far has <em>owned</em> its data. When a struct holds a <code>String</code>, it owns that string outright. When it holds a <code>Vec</code>, it owns the vector. But there are valid situations where you want a struct to hold a <em>reference</em> to data living somewhere else: data the struct does not own, only borrows. In those cases, Rust requires you to be explicit about how long the borrow lasts, using lifetime annotations on the struct definition.</p>

<h2>The Rental Agreement Analogy</h2>

<p>Think of a tenant who holds a key to an apartment. The tenant does not own the apartment: they only have access to it. The key becomes useless the moment the apartment is demolished. A lease agreement is the written guarantee that the tenant cannot keep living there after the building is gone. Rust lifetime annotations on structs work exactly the same way: they are the written guarantee, enforced by the compiler, that a struct instance cannot outlive the data it references.</p>

<h2>Why Unannotated Reference Fields Are Rejected</h2>

<p>If you try to write a struct that holds a string slice without any lifetime annotation, the compiler refuses:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
struct Highlight {
    excerpt: &amp;str,
}

fn main() {
    let text = String::from("Rust is systems programming without fear.");
    let h = Highlight { excerpt: &amp;text[0..4] };
    println!("{}", h.excerpt);
}</code></pre>
</div>

<pre class="output"><code>error[E0106]: missing lifetime specifier
 --> src/main.rs:3:15
  |
3 |     excerpt: &amp;str,
  |               ^ expected named lifetime parameter</code></pre>

<p>The compiler cannot tell how long the borrow in <code>excerpt</code> must remain valid. Without that information it cannot guarantee the struct never outlives its referenced data. The lifetime annotation supplies exactly that information.</p>

<h2>Adding the Lifetime Annotation</h2>

<p>A lifetime parameter is introduced after the struct name in angle brackets, prefixed with a tick mark. You then use that parameter on every reference field:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Highlight&lt;'a&gt; {
    excerpt: &amp;'a str,
}

fn main() {
    let text = String::from("Rust is systems programming without fear.");
    let h = Highlight { excerpt: &amp;text[0..4] };
    println!("{}", h.excerpt); // prints: Rust
}</code></pre>
</div>

<pre class="output"><code>Rust</code></pre>

<p>Reading the annotation out loud: "for some lifetime <code>'a</code>, <code>Highlight</code> holds a reference to a string slice that is valid for at least <code>'a</code>, and the <code>Highlight</code> instance itself lives no longer than <code>'a</code>." The name <code>'a</code> is just a label, like a variable name. You could call it <code>'excerpt</code> or <code>'doc</code>, but single lowercase letters are the convention for simple cases.</p>

<h2>The Compiler Enforcing the Guarantee</h2>

<p>Here is what happens when you try to keep the struct alive longer than the data it references:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Highlight&lt;'a&gt; {
    excerpt: &amp;'a str,
}

fn main() {
    let h;
    {
        let text = String::from("Rust is memory safe.");
        h = Highlight { excerpt: &amp;text[0..4] };
    } // text is dropped here
    println!("{}", h.excerpt); // h now holds a dangling reference
}</code></pre>
</div>

<pre class="output"><code>error[E0597]: \`text\` does not live long enough
  --> src/main.rs:9:31
   |
9  |         h = Highlight { excerpt: &amp;text[0..4] };
   |                                   ^^^^ borrowed value does not live long enough
10 |     }
   |     - \`text\` dropped here while still borrowed
11 |     println!("{}", h.excerpt);
   |                    --------- borrow later used here</code></pre>

<p>The compiler caught a real memory safety bug before the program ran. The lifetime annotation on the struct made the relationship visible, so the compiler could check it statically.</p>

<h2>Methods on Structs with Lifetimes</h2>

<p>When you write an <code>impl</code> block for a lifetime-bearing struct, you must declare the lifetime parameter after <code>impl</code> and also write it after the struct name:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Highlight&lt;'a&gt; {
    excerpt: &amp;'a str,
}

impl&lt;'a&gt; Highlight&lt;'a&gt; {
    fn word_count(&amp;self) -&gt; usize {
        self.excerpt.split_whitespace().count()
    }

    fn text(&amp;self) -&gt; &amp;str {
        self.excerpt
    }
}

fn main() {
    let text = String::from("Rust is fast safe and fun to write.");
    let h = Highlight { excerpt: &amp;text[0..22] };
    println!("Excerpt : '{}'", h.text());
    println!("Words   : {}", h.word_count());
}</code></pre>
</div>

<pre class="output"><code>Excerpt : 'Rust is fast safe and fu'
Words   : 5</code></pre>

<p>Inside the methods, <code>text(&amp;self) -&gt; &amp;str</code> works without an explicit lifetime on the return because lifetime elision's third rule applies: the output lifetime is assigned to <code>&amp;self</code>. The method effectively returns a reference tied to the struct, which is tied to <code>'a</code>, which is tied to the original data. The chain holds.</p>

<h2>A Method That Returns Either the Struct's Data or a Parameter</h2>

<p>Now consider a method that takes a second string and returns whichever is longer: the stored excerpt or the incoming string. This time elision cannot help because there are two possible sources for the return value:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Highlight&lt;'a&gt; {
    excerpt: &amp;'a str,
}

impl&lt;'a&gt; Highlight&lt;'a&gt; {
    fn or_longer&lt;'b&gt;(&amp;self, other: &amp;'b str) -&gt; &amp;'a str
    where
        'b: 'a,   // 'b must outlive 'a so returning from other is safe
    {
        if self.excerpt.len() &gt;= other.len() {
            self.excerpt
        } else {
            other
        }
    }
}

fn main() {
    let base = String::from("Hello world, this is Rust.");
    let h = Highlight { excerpt: &amp;base };

    let other = String::from("Short.");
    println!("{}", h.or_longer(&amp;other)); // prints the longer one
}</code></pre>
</div>

<pre class="output"><code>Hello world, this is Rust.</code></pre>

<p>The bound <code>'b: 'a</code> reads "lifetime <code>'b</code> must outlive (or equal) lifetime <code>'a</code>." This guarantees that if the method returns <code>other</code>, the caller is still holding the data <code>other</code> points to for at least as long as they hold <code>h</code>. Do not worry if this feels complex: the compiler will tell you exactly when such bounds are needed.</p>

<h2>Structs with Multiple Reference Fields</h2>

<p>A struct can have multiple reference fields. Use one lifetime parameter if all references share the same source lifetime, or separate parameters if they can come from independent scopes:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Single lifetime: both fields must outlive the same scope.
struct NamedQuote&lt;'a&gt; {
    author: &amp;'a str,
    quote:  &amp;'a str,
}

// Two lifetimes: author and quote can come from data with different scopes.
struct FlexibleQuote&lt;'a, 'b&gt; {
    author: &amp;'a str,
    quote:  &amp;'b str,
}

fn main() {
    let author = String::from("Kernighan");

    let q = FlexibleQuote {
        author: &amp;author,
        quote:  "Debugging is twice as hard as writing the code.", // 'static
    };
    println!("{}: {}", q.author, q.quote);
}</code></pre>
</div>

<pre class="output"><code>Kernighan: Debugging is twice as hard as writing the code.</code></pre>

<h2>When to Choose Reference Fields vs Owned Fields</h2>

<p>Holding references in a struct adds lifetime parameters everywhere the struct is used. Before reaching for a reference field, consider whether owning the data is simpler:</p>

<dl>
  <dt>Prefer owned fields (<code>String</code>, <code>Vec</code>, etc.) when</dt>
  <dd>The struct lives beyond a single function, is stored in a collection, or is returned from functions. Owned data carries no lifetime bookkeeping.</dd>
  <dt>Prefer reference fields when</dt>
  <dd>The struct is a short-lived view over data you already have, copying the data would be expensive, and you control the lifetime of the source data completely.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Many Rust libraries offer two variants: a borrowed version (e.g., <code>Highlight&lt;'a&gt;</code> with a <code>&amp;'a str</code> field) for zero-copy performance, and an owned version (e.g., <code>OwnedHighlight</code> with a <code>String</code> field) for ergonomic long-lived storage. You are not forced to choose one forever.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting the Lifetime on the impl Block</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN
struct Wrapper&lt;'a&gt; { value: &amp;'a str }

impl Wrapper {           // error: missing lifetime specifier
    fn get(&amp;self) -&gt; &amp;str { self.value }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: declare 'a after impl, then use it after the type name
impl&lt;'a&gt; Wrapper&lt;'a&gt; {
    fn get(&amp;self) -&gt; &amp;str { self.value }
}</code></pre>
</div>

<h3>Mistake 2: Storing a Reference to a Local Variable Inside a Function</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: s is created inside make_view and dropped at its end
struct View&lt;'a&gt; { text: &amp;'a str }

fn make_view() -&gt; View {
    let s = String::from("local data");
    View { text: &amp;s } // s is dropped here — dangling reference
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED option 1: take the source as a parameter so the caller keeps it alive
fn make_view&lt;'a&gt;(s: &amp;'a str) -&gt; View&lt;'a&gt; {
    View { text: s }
}

// FIXED option 2: own the data — no lifetime needed
struct OwnedView { text: String }
fn make_owned_view() -&gt; OwnedView {
    OwnedView { text: String::from("local data") }
}</code></pre>
</div>

<h3>Mistake 3: Using the Same Lifetime for Two Unrelated Fields and Causing Unnecessary Restrictions</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// OVERLY RESTRICTIVE: forces both fields to share the shorter lifetime
struct Pair&lt;'a&gt; { first: &amp;'a str, second: &amp;'a str }

fn make(first: &amp;str, second: &amp;str) -&gt; Pair {
    Pair { first, second }  // the returned Pair can only live as long as the shorter input
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// MORE FLEXIBLE: two independent lifetimes
struct Pair&lt;'a, 'b&gt; { first: &amp;'a str, second: &amp;'b str }

fn make&lt;'a, 'b&gt;(first: &amp;'a str, second: &amp;'b str) -&gt; Pair&lt;'a, 'b&gt; {
    Pair { first, second }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 30: The 'static Lifetime
     --------------------------------------------------------------- */
  'ch30': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes &amp; Memory Safety',
    chNum: 30,
    title: "The 'static Lifetime",
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 30</span>
</div>

<h1>The 'static Lifetime</h1>

<p>You have seen lifetime parameters like <code>'a</code> that connect the lifetime of a reference to the lifetime of some value you already have. But Rust also has a special built-in lifetime called <code>'static</code>. A reference with a <code>'static</code> lifetime is valid for the <em>entire duration of the program</em>. This makes it the longest possible lifetime in any Rust program.</p>

<p>Understanding <code>'static</code> properly saves you from two opposite mistakes: using it too freely to silence compiler errors (which creates real bugs), and avoiding it entirely when it is the correct and natural choice.</p>

<h2>The Printed Placard vs Whiteboard Analogy</h2>

<p>Imagine two signs in an office. One is a printed and framed placard bolted to the wall: "Emergency Exit." It is there from the day the building opens until the day it is torn down. The other is a whiteboard note: "Meeting room booked until 3pm." It exists only as long as someone decides to keep it there and could be erased at any time. A <code>'static</code> reference is like the bolted placard: the data it points to is guaranteed to exist for the entire program run. All other lifetimes are like the whiteboard: they exist for a defined, bounded window of time.</p>

<h2>String Literals Are 'static</h2>

<p>The most common <code>'static</code> data in any Rust program is a string literal. When you write <code>"hello"</code> in your code, that string is baked directly into the compiled binary. The binary exists for as long as the program runs, so the string exists for as long as the program runs:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s: &amp;'static str = "I live in the binary.";
    println!("{}", s);

    // The annotation is usually omitted because the compiler infers it.
    let s2 = "This is also 'static.";
    println!("{}", s2);
}</code></pre>
</div>

<pre class="output"><code>I live in the binary.
This is also 'static.</code></pre>

<p>You almost never write <code>&amp;'static str</code> explicitly: the compiler infers it. The annotation is shown here for clarity.</p>

<h2>What 'static Actually Means</h2>

<p>The word "static" can be misleading because it sounds like the value never moves or changes. That is not quite right. <code>'static</code> on a reference means the reference is valid for the entire program. It says nothing about mutability. Think of it as the widest possible expiry date: this reference will never expire before the program ends.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// A function that returns a 'static string reference.
// Safe because string literals live in the binary.
fn greeting() -&gt; &amp;'static str {
    "Hello, Rustacean!"
}

fn main() {
    let g = greeting();
    println!("{}", g); // valid anywhere in the program
}</code></pre>
</div>

<pre class="output"><code>Hello, Rustacean!</code></pre>

<h2>Creating 'static Data with static Variables</h2>

<p>Besides string literals, you can create <code>'static</code> data explicitly using <code>static</code> variables. A <code>static</code> variable lives in a fixed memory location for the entire program, just like a global constant in C or C++:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">static APP_NAME: &amp;str = "RustLMS";
static MAX_RETRIES: u32 = 5;

fn greet_app() -&gt; &amp;'static str {
    APP_NAME // APP_NAME is 'static, so a reference to it is also 'static
}

fn main() {
    println!("Welcome to {}", greet_app());
    println!("Will retry up to {} times.", MAX_RETRIES);
}</code></pre>
</div>

<pre class="output"><code>Welcome to RustLMS
Will retry up to 5 times.</code></pre>

<h2>The 'static Lifetime Bound on Generics</h2>

<p>You will often see <code>'static</code> not on a reference but as a <em>bound</em> on a generic type parameter, written as <code>T: 'static</code>. This means something slightly different from a <code>'static</code> reference: it means <code>T</code> must not contain any non-static references.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This function requires T to contain no borrowed references
// (or only 'static references).
fn store_forever&lt;T: 'static&gt;(value: T) {
    // In real code you might send this to a thread or put it in a global cache.
    println!("Storing a value with no borrowed references inside.");
    drop(value);
}

fn main() {
    store_forever(42i32);                      // i32 is 'static
    store_forever(String::from("owned data")); // String owns its data, also 'static
    store_forever("literal");                  // &'static str is 'static

    let s = String::from("temporary");
    let r = &amp;s;
    // store_forever(r); // error: r borrows s, which is not 'static
}</code></pre>
</div>

<p>The key insight: <em>owned types like <code>String</code>, <code>Vec&lt;i32&gt;</code>, and <code>i32</code> satisfy <code>T: 'static</code></em> because they do not contain any borrowed references at all. You do not need to use string literals to satisfy a <code>'static</code> bound: you can use any owned value.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>T: 'static</code> is common in multi-threading APIs because threads need data that will not be invalidated by another thread dropping a value. The <code>std::thread::spawn</code> closure requires <code>F: 'static</code> for exactly this reason.</p>
</div>

<h2>Box&lt;dyn Trait&gt; and 'static</h2>

<p>When working with trait objects, you will often see <code>Box&lt;dyn SomeTrait + 'static&gt;</code> or simply <code>Box&lt;dyn SomeTrait&gt;</code> (which defaults to <code>'static</code> in many positions):</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">trait Greet {
    fn say_hi(&amp;self) -&gt; &amp;str;
}

struct English;
impl Greet for English {
    fn say_hi(&amp;self) -&gt; &amp;str { "Hello!" }
}

// Box&lt;dyn Greet&gt; implicitly has 'static bound in return position.
fn make_greeter() -&gt; Box&lt;dyn Greet&gt; {
    Box::new(English)
}

fn main() {
    let g = make_greeter();
    println!("{}", g.say_hi());
}</code></pre>
</div>

<pre class="output"><code>Hello!</code></pre>

<h2>When to Actually Use 'static</h2>

<p>Reach for <code>'static</code> in these genuine situations:</p>

<dl>
  <dt>String literals and compile-time constants</dt>
  <dd>Error messages, application names, version strings, and other values baked into the binary. This is the most natural use.</dd>
  <dt>Global configuration or lookup tables</dt>
  <dd><code>static</code> variables that hold data needed for the entire program, such as a static array of command names.</dd>
  <dt>Thread spawn closures</dt>
  <dd>Closures passed to <code>std::thread::spawn</code> must satisfy <code>'static</code> because threads can outlive the scope they were created in. Pass owned data, not references.</dd>
</dl>

<h2>The Most Important Warning: Do Not Use 'static to Silence Errors</h2>

<p>When the compiler complains about a lifetime, it is tempting to add <code>'static</code> everywhere until the error goes away. This is almost always the wrong move. Here is what that looks like and why it fails:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WRONG approach: trying to use 'static to return a local String's reference
fn make_greeting(name: &amp;str) -&gt; &amp;'static str {
    let greeting = format!("Hello, {}!", name);
    &amp;greeting // error: greeting is local, not 'static
    // The String is dropped here — this would be a dangling reference.
}</code></pre>
</div>

<pre class="output"><code>error[E0515]: cannot return reference to local variable \`greeting\`
  --> src/main.rs:4:5
   |
4  |     &amp;greeting
   |     ^^^^^^^^^ returns a reference to data owned by the current function</code></pre>

<p>Adding <code>'static</code> to the return type does not make the local <code>String</code> live longer: it just widens the contract the compiler will check against. The underlying bug (returning a dangling reference) remains. The correct fix is to return an owned <code>String</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CORRECT: return owned data when you create data inside the function
fn make_greeting(name: &amp;str) -&gt; String {
    format!("Hello, {}!", name)
}

fn main() {
    println!("{}", make_greeting("Rustacean"));
}</code></pre>
</div>

<pre class="output"><code>Hello, Rustacean!</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The official Rust book says: "Before specifying <code>'static</code> as the lifetime for a reference, think about whether the reference you have actually lives the entire lifetime of your program or not, and whether you want it to." If the answer is no, fix the real lifetime issue instead.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Thinking 'static Prevents a Value from Being Dropped</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// MISCONCEPTION: 'static means the value is immortal
fn main() {
    let s: &amp;'static str = "hello"; // This IS static — lives in the binary.

    let owned: String = String::from("world"); // This is NOT static.
    // owned will be dropped at the end of main, even though String satisfies T: 'static.
    // T: 'static means "contains no borrowed references", not "lives forever".
    println!("{} {}", s, owned);
} // owned is dropped here — completely normal</code></pre>
</div>

<p>A value satisfying <code>T: 'static</code> can still be dropped when it goes out of scope. The bound only means it contains no borrowed references that could become invalid.</p>

<h3>Mistake 2: Adding 'static to Fix a Lifetime Error Instead of Fixing the Root Cause</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WRONG: pasting 'static everywhere to silence errors
struct Config&lt;'a&gt; { host: &amp;'a str }

fn get_host() -&gt; &amp;'static str {
    let host = String::from("localhost"); // local — not 'static
    &amp;host // error: returns reference to local data
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return owned data when you compute it inside the function
fn get_host() -&gt; String {
    String::from("localhost")
}

// OR: use a real static if the value is truly constant
static HOST: &amp;str = "localhost";
fn get_static_host() -&gt; &amp;'static str {
    HOST
}</code></pre>
</div>

<h3>Mistake 3: Thinking &amp;str Arguments Must Be 'static</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WRONG assumption: this function looks like it needs 'static input
fn print_upper(s: &amp;'static str) {
    println!("{}", s.to_uppercase());
}

fn main() {
    let dynamic = String::from("hello"); // not 'static
    print_upper(&amp;dynamic); // error: &String is not &'static str
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use a regular lifetime — the function does not need 'static
fn print_upper(s: &amp;str) { // works with any lifetime
    println!("{}", s.to_uppercase());
}

fn main() {
    let dynamic = String::from("hello");
    print_upper(&amp;dynamic); // fine
    print_upper("literal");  // also fine
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 31: Designing Lifetime-Safe APIs
     --------------------------------------------------------------- */
  'ch31': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes &amp; Memory Safety',
    chNum: 31,
    title: 'Designing Lifetime-Safe APIs',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 31</span>
</div>

<h1>Designing Lifetime-Safe APIs</h1>

<p>Knowing the syntax of lifetime annotations is one thing. Knowing <em>when</em> to use them, and how to design functions and types so that lifetimes add value rather than complexity, is the skill that makes Rust code a pleasure to use. This chapter walks through the key decisions you face when designing an API that involves references.</p>

<h2>The Contract Analogy</h2>

<p>Think of a function's lifetime annotations as a contract between the function and its callers. When you write <code>fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str</code>, you are writing a contract that says: "I promise that the reference I return will remain valid for as long as both of your inputs remain valid." The caller agrees to uphold their end: keep both inputs alive for as long as they use the return value. The compiler is the notary that verifies both parties keep their promises.</p>

<p>Good API design means writing contracts that are as simple and honest as possible: no more restrictive than necessary, no more permissive than safe.</p>

<h2>The First Question: Should the Function Return a Reference at All?</h2>

<p>Before annotating lifetimes, ask: does this function <em>need</em> to return a reference? There are only two situations where returning a reference makes sense:</p>

<ol>
  <li>The function is <strong>finding or slicing</strong> into data that already exists in one of its input references.</li>
  <li>The function is <strong>exposing a field</strong> of a struct it receives as input.</li>
</ol>

<p>In every other case, returning an owned value is simpler and eliminates all lifetime complexity:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Returning a reference makes sense: we are slicing into existing input data.
fn first_word(s: &amp;str) -&gt; &amp;str {
    match s.find(' ') {
        Some(i) =&gt; &amp;s[..i],
        None    =&gt; s,
    }
}

// Returning owned data makes sense: we are computing something new.
fn shout(s: &amp;str) -&gt; String {
    s.to_uppercase() + "!"
}

fn main() {
    let sentence = String::from("hello world");
    println!("{}", first_word(&amp;sentence)); // hello
    println!("{}", shout(&amp;sentence));       // HELLO WORLD!
}</code></pre>
</div>

<pre class="output"><code>hello
HELLO WORLD!</code></pre>

<p>Notice that <code>first_word</code> returns a slice of the input and therefore returns a reference. <code>shout</code> creates a brand-new <code>String</code> and returns that owned value. No lifetime annotation is needed on <code>shout</code> because it returns no reference.</p>

<h2>Only Annotate the Inputs That Govern the Output</h2>

<p>When a function returns a reference, the annotation only needs to connect the output to the <em>specific input</em> it comes from. Do not annotate inputs that have nothing to do with the return value:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// The return value always comes from x, never from y.
// Only x needs the lifetime annotation on the return.
fn first_or_fallback&lt;'a&gt;(x: &amp;'a str, _y: &amp;str) -&gt; &amp;'a str {
    x
}

fn main() {
    let primary = String::from("primary value");
    let result;
    {
        let secondary = String::from("secondary value");
        result = first_or_fallback(&amp;primary, &amp;secondary);
        // secondary is dropped here, but result only depends on primary
    }
    println!("{}", result); // fine: primary is still alive
}</code></pre>
</div>

<pre class="output"><code>primary value</code></pre>

<p>If you had annotated both parameters with <code>'a</code>, the compiler would force the caller to keep <em>both</em> alive as long as the result is used. That would be a lie in your contract: you never actually use <code>y</code> in the output. Honest annotations lead to less restrictive, more usable APIs.</p>

<h2>Structs That Borrow From Their Environment</h2>

<p>A common API pattern is a struct that holds a reference to data provided by the caller, acting as a lightweight view or parser over that data. Here is a realistic example: a line iterator over a borrowed string:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct LineReader&lt;'a&gt; {
    text:   &amp;'a str,
    cursor: usize,
}

impl&lt;'a&gt; LineReader&lt;'a&gt; {
    fn new(text: &amp;'a str) -&gt; Self {
        LineReader { text, cursor: 0 }
    }

    fn next_line(&amp;mut self) -&gt; Option&lt;&amp;'a str&gt; {
        if self.cursor &gt;= self.text.len() {
            return None;
        }
        let remaining = &amp;self.text[self.cursor..];
        match remaining.find('\n') {
            Some(i) =&gt; {
                let line = &amp;remaining[..i];
                self.cursor += i + 1;
                Some(line)
            }
            None =&gt; {
                self.cursor = self.text.len();
                Some(remaining)
            }
        }
    }
}

fn main() {
    let doc = String::from("line one\nline two\nline three");
    let mut reader = LineReader::new(&amp;doc);

    while let Some(line) = reader.next_line() {
        println!("{}", line);
    }
}</code></pre>
</div>

<pre class="output"><code>line one
line two
line three</code></pre>

<p>Notice the return type <code>Option&lt;&amp;'a str&gt;</code> on <code>next_line</code>. This says the returned line slices are valid for the lifetime of the original document, not just the lifetime of the <code>LineReader</code>. That is intentional: the caller can collect all lines into a <code>Vec&lt;&amp;str&gt;</code> and use them after the reader is dropped, as long as the original document is still alive.</p>

<h2>Combining Lifetime Parameters with Generic Types</h2>

<p>Lifetime parameters and generic type parameters coexist in the same angle-bracket list. Here is a function that announces something before returning the longer of two slices, where the announcement type is generic:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt::Display;

fn longest_with_announcement&lt;'a, T&gt;(
    x: &amp;'a str,
    y: &amp;'a str,
    ann: T,
) -&gt; &amp;'a str
where
    T: Display,
{
    println!("Announcement: {}", ann);
    if x.len() &gt;= y.len() { x } else { y }
}

fn main() {
    let a = String::from("the long candidate");
    let b = String::from("short");
    let result = longest_with_announcement(&amp;a, &amp;b, "Comparing now...");
    println!("Longer: {}", result);
}</code></pre>
</div>

<pre class="output"><code>Announcement: Comparing now...
Longer: the long candidate</code></pre>

<h2>Avoiding Lifetime Complexity: Practical Rules of Thumb</h2>

<dl>
  <dt>Return owned types from constructors and factories</dt>
  <dd>Functions that build new data (<code>new</code>, <code>from</code>, <code>parse</code>, <code>build</code>) should return owned values. Lifetime parameters on constructors are a warning sign that the design needs rethinking.</dd>
  <dt>Use lifetimes on reader/view types, not writer/builder types</dt>
  <dd>Structs that inspect or iterate over existing data are natural candidates for reference fields. Structs that accumulate or transform data should own their data.</dd>
  <dt>Let elision do its job</dt>
  <dd>Do not add lifetime annotations that the compiler would infer automatically. Only annotate when the compiler tells you to. Over-annotating adds visual noise without any safety benefit.</dd>
  <dt>When in doubt, clone</dt>
  <dd>Returning a cloned or owned copy of data costs a small allocation but eliminates all lifetime bookkeeping. Optimize with references only after profiling confirms it is needed.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The Rust standard library makes this trade-off visible in its string types: <code>&amp;str</code> (borrowed, zero-copy) and <code>String</code> (owned, allocates). Your APIs can follow the same pattern: offer a fast borrowed version and a convenient owned version, letting callers choose.</p>
</div>

<h2>A Complete Design Example: Text Extractor</h2>

<p>Here is a small but complete API that demonstrates these principles: a struct that parses a document and extracts sections by heading:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct SectionExtractor&lt;'doc&gt; {
    source: &amp;'doc str,
}

impl&lt;'doc&gt; SectionExtractor&lt;'doc&gt; {
    fn new(source: &amp;'doc str) -&gt; Self {
        SectionExtractor { source }
    }

    // Returns None if the heading is not found.
    // The returned slice borrows from 'doc, not from self.
    fn section_after(&amp;self, heading: &amp;str) -&gt; Option&lt;&amp;'doc str&gt; {
        let start = self.source.find(heading)?;
        let after_heading = start + heading.len();
        Some(&amp;self.source[after_heading..].trim_start())
    }
}

fn main() {
    let document = String::from(
        "Introduction\nWelcome to Rust.\n\nBody\nThis is the body text."
    );
    let extractor = SectionExtractor::new(&amp;document);

    if let Some(body) = extractor.section_after("Body\n") {
        println!("Body section: {}", body);
    }
}</code></pre>
</div>

<pre class="output"><code>Body section: This is the body text.</code></pre>

<p>The lifetime parameter is named <code>'doc</code> instead of <code>'a</code> to make the intent clearer: slices returned from this struct borrow from the original document. This is a documentation benefit of named lifetime parameters.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Returning a Reference to Locally Computed Data</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: greeting is created inside the function and dropped at its end
fn build_greeting&lt;'a&gt;(name: &amp;'a str) -&gt; &amp;'a str {
    let greeting = format!("Hello, {}!", name);
    &amp;greeting // error: greeting does not live long enough
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return the owned String
fn build_greeting(name: &amp;str) -&gt; String {
    format!("Hello, {}!", name)
}</code></pre>
</div>

<h3>Mistake 2: Over-Connecting Lifetimes Between Unrelated Parameters</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// OVERLY RESTRICTIVE: both x and y must live as long as the result,
// even though the result can only ever come from x.
fn take_first&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    x
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// MORE HONEST: y's lifetime is irrelevant to the result
fn take_first&lt;'a&gt;(x: &amp;'a str, _y: &amp;str) -&gt; &amp;'a str {
    x
}</code></pre>
</div>

<h3>Mistake 3: Adding Unnecessary Lifetime Parameters to Simple Methods</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Counter { count: u32 }

impl Counter {
    // UNNECESSARY: elision handles this perfectly
    fn value&lt;'a&gt;(&amp;'a self) -&gt; &amp;'a u32 {
        &amp;self.count
    }
}
</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">impl Counter {
    // CORRECT: let elision do its job
    fn value(&amp;self) -&gt; &amp;u32 {
        &amp;self.count
    }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 32: Debugging Lifetime Errors
     --------------------------------------------------------------- */
  'ch32': {
    moduleNum: 5,
    moduleTitle: 'Lifetimes &amp; Memory Safety',
    chNum: 32,
    title: 'Debugging Lifetime Errors',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 5 &mdash; Chapter 32</span>
</div>

<h1>Debugging Lifetime Errors</h1>

<p>Lifetime errors can feel cryptic at first: walls of red text about things "not living long enough" or "missing lifetime specifiers." But the Rust compiler is not being hostile. It is being a very precise code reviewer, pointing at the exact line where a reference would become invalid. Once you learn to read the error messages systematically, you will find that they almost always tell you exactly what to fix.</p>

<p>This chapter catalogs the most common lifetime error patterns, shows what they look like, and walks through the diagnostic process for each.</p>

<h2>The Code Inspector Analogy</h2>

<p>Think of the Rust compiler as a building inspector who checks that every electrical wire is connected to something solid before the building opens. The inspector does not care about your plans or intentions: they only check what is actually wired up. When the compiler says "this reference does not live long enough," it is pointing at a wire that is connected to a socket that will be removed before anyone can use it. Your job is to either extend the socket's life, shorten the wire, or replace the wire with something self-contained.</p>

<h2>Error E0597: "Does Not Live Long Enough"</h2>

<p>This is the most common lifetime error. It appears when you try to use a reference after the value it points to has been dropped:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let reference;
    {
        let value = String::from("temporary");
        reference = &amp;value; // borrow starts here
    }                        // value dropped here
    println!("{}", reference); // borrow used here — value is gone
}</code></pre>
</div>

<pre class="output"><code>error[E0597]: \`value\` does not live long enough
 --> src/main.rs:5:19
  |
4 |         reference = &amp;value;
  |                     ^^^^^^ borrowed value does not live long enough
5 |     }
  |     - \`value\` dropped here while still borrowed
6 |     println!("{}", reference);
  |                    --------- borrow later used here</code></pre>

<p>The error message tells you three things: which value does not live long enough (<code>value</code>), where it was borrowed (<code>&amp;value</code>), and where the borrow is used after the value was dropped (<code>println!</code>). The fix is to move the use inside the scope, or move the declaration of <code>value</code> outside the block:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Fix 1: Move the use inside the scope
fn main() {
    let value = String::from("temporary");
    let reference = &amp;value;
    println!("{}", reference); // used before value is dropped
}

// Fix 2: Move value outside the block so it lives long enough
fn main() {
    let value = String::from("temporary");
    let reference;
    {
        reference = &amp;value; // value still alive in outer scope
    }
    println!("{}", reference); // still fine — value is dropped at end of main
}</code></pre>
</div>

<h2>Error E0515: "Cannot Return Value Referencing Local Variable"</h2>

<p>This error appears when a function tries to return a reference to data it created internally:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn get_processed(input: &amp;str) -&gt; &amp;str {
    let processed = input.to_uppercase(); // new String created here
    &amp;processed                            // trying to return reference to it
}                                         // processed is dropped here</code></pre>
</div>

<pre class="output"><code>error[E0515]: cannot return reference to local variable \`processed\`
 --> src/main.rs:3:5
  |
3 |     &amp;processed
  |     ^^^^^^^^^^ returns a reference to data owned by the current function</code></pre>

<p>The fix for this error is almost always to return the owned value instead of a reference to it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return the owned String
fn get_processed(input: &amp;str) -&gt; String {
    input.to_uppercase()
}

fn main() {
    let result = get_processed("hello");
    println!("{}", result); // HELLO
}</code></pre>
</div>

<pre class="output"><code>HELLO</code></pre>

<h2>Error E0106: "Missing Lifetime Specifier"</h2>

<p>This error appears when a function or struct has a reference in a position where the compiler cannot automatically determine the lifetime:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Missing lifetime: two input references, one output reference
fn choose(a: &amp;str, b: &amp;str, use_a: bool) -&gt; &amp;str {
    if use_a { a } else { b }
}</code></pre>
</div>

<pre class="output"><code>error[E0106]: missing lifetime specifier
 --> src/main.rs:2:43
  |
2 | fn choose(a: &amp;str, b: &amp;str, use_a: bool) -&gt; &amp;str {
  |              ----     ----                   ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the signature does not say
          whether it is borrowed from \`a\` or \`b\`</code></pre>

<p>The compiler is telling you exactly what it needs: a named lifetime that clarifies whether the return value comes from <code>a</code>, from <code>b</code>, or from both. Since this function can return either, both inputs must share the same lifetime:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: tie output lifetime to both inputs
fn choose&lt;'a&gt;(a: &amp;'a str, b: &amp;'a str, use_a: bool) -&gt; &amp;'a str {
    if use_a { a } else { b }
}

fn main() {
    let x = String::from("option A");
    let y = String::from("option B");
    println!("{}", choose(&amp;x, &amp;y, true));  // option A
    println!("{}", choose(&amp;x, &amp;y, false)); // option B
}</code></pre>
</div>

<pre class="output"><code>option A
option B</code></pre>

<h2>The Systematic Debugging Process</h2>

<p>When you hit a lifetime error, follow these steps in order:</p>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body">
    <p><strong>Read the full error message.</strong> The compiler tells you the variable name, the line where it was borrowed, and the line where it is used after expiry. These three pieces of information are always present in E0597 errors.</p>
  </div>
</div>

<div class="step">
  <div class="step-num">2</div>
  <div class="step-body">
    <p><strong>Ask: is the function returning a reference to something it created?</strong> If yes, change the return type to an owned value. This solves E0515 errors every time.</p>
  </div>
</div>

<div class="step">
  <div class="step-num">3</div>
  <div class="step-body">
    <p><strong>Ask: does the returned reference come from one of the inputs?</strong> If yes, add a lifetime annotation connecting the output to that specific input. Add only the inputs that could actually be returned.</p>
  </div>
</div>

<div class="step">
  <div class="step-num">4</div>
  <div class="step-body">
    <p><strong>Ask: is the value going out of scope too early?</strong> Move the declaration earlier (to a wider scope) so the value lives long enough for all borrows that use it.</p>
  </div>
</div>

<div class="step">
  <div class="step-num">5</div>
  <div class="step-body">
    <p><strong>As a last resort: clone or own the data.</strong> If restructuring is too complex, clone the value so the new owner is independent of the original. This adds a small allocation but eliminates the lifetime problem entirely.</p>
  </div>
</div>

<h2>Diagnosing a Real Lifetime Error End to End</h2>

<p>Here is a realistic scenario: you write a cache struct that stores the result of an expensive lookup:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN version
struct Cache {
    data: &amp;str, // error E0106: missing lifetime specifier
}

impl Cache {
    fn new(source: &amp;str) -&gt; Cache {
        Cache { data: source }
    }

    fn get(&amp;self) -&gt; &amp;str {
        self.data
    }
}</code></pre>
</div>

<p>Step 1: the compiler says "missing lifetime specifier" on the <code>&amp;str</code> field. Step 2: we know this struct is a view over borrowed data, not a creator of new data. Step 3: add the lifetime parameter:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: lifetime parameter added everywhere it is needed
struct Cache&lt;'a&gt; {
    data: &amp;'a str,
}

impl&lt;'a&gt; Cache&lt;'a&gt; {
    fn new(source: &amp;'a str) -&gt; Cache&lt;'a&gt; {
        Cache { data: source }
    }

    fn get(&amp;self) -&gt; &amp;str {
        self.data
    }
}

fn main() {
    let source = String::from("expensive lookup result");
    let cache = Cache::new(&amp;source);
    println!("{}", cache.get()); // expensive lookup result
}</code></pre>
</div>

<pre class="output"><code>expensive lookup result</code></pre>

<p>Alternatively, if the struct does not need to be a view (if you just want simple storage), own the data:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Simpler: own the data, no lifetime needed at all
struct Cache {
    data: String,
}

impl Cache {
    fn new(source: &amp;str) -&gt; Cache {
        Cache { data: source.to_owned() }
    }

    fn get(&amp;self) -&gt; &amp;str {
        &amp;self.data
    }
}

fn main() {
    let cache = Cache::new("expensive lookup result");
    println!("{}", cache.get()); // expensive lookup result
}</code></pre>
</div>

<pre class="output"><code>expensive lookup result</code></pre>

<h2>Reading Lifetime Error Suggestions Carefully</h2>

<p>The compiler often appends a "help" or "consider" suggestion to lifetime errors. These suggestions are useful starting points, but not always the best fix. Here is a case where the compiler's suggestion is technically valid but not ideal:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn describe(value: &amp;str) -&gt; &amp;str {
    // Error: compiler suggests adding 'static.
    // But 'static would be too restrictive for callers.
    let description = format!("Value is: {}", value);
    &amp;description // local variable, cannot return reference to it
}</code></pre>
</div>

<pre class="output"><code>help: consider using the \`'static\` lifetime, but this is uncommon
      unless you're returning a borrowed value from a \`const\` or a \`static\`</code></pre>

<p>The compiler warns you itself: using <code>'static</code> is uncommon here. The real fix is to return a <code>String</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CORRECT: return the owned String, not a reference
fn describe(value: &amp;str) -&gt; String {
    format!("Value is: {}", value)
}

fn main() {
    println!("{}", describe("hello")); // Value is: hello
}</code></pre>
</div>

<pre class="output"><code>Value is: hello</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using 'static to Silence a Lifetime Error</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WRONG: 'static does not fix the underlying dangling reference
fn get_name() -&gt; &amp;'static str {
    let name = String::from("Alice");
    &amp;name // error: name is dropped at end of function, not 'static
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return owned data when you compute it inside the function
fn get_name() -&gt; String {
    String::from("Alice")
}

// OR use a real static if the value is a constant
fn get_name_static() -&gt; &amp;'static str {
    "Alice"
}</code></pre>
</div>

<h3>Mistake 2: Declaring the Value Too Late (Inside a Nested Block)</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let r;
    {
        let x = 42;
        r = &amp;x; // x is dropped at end of this block
    }
    println!("{}", r); // error: x does not live long enough
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: move x to the outer scope
fn main() {
    let x = 42;   // now x lives as long as r
    let r = &amp;x;
    println!("{}", r); // fine
}</code></pre>
</div>

<h3>Mistake 3: Confusing the Lifetime of the Reference With the Lifetime of the Value</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s = String::from("hello");
    let r: &amp;str = &amp;s;

    // s is still alive here — r is valid.
    println!("{}", r);

    drop(s); // explicitly drop s

    // r would now be a dangling reference.
    // The compiler prevents you from using r after this point.
    // println!("{}", r); // error if uncommented
}</code></pre>
</div>

<p>The reference <code>r</code> and the <code>String</code> <code>s</code> are different things. The lifetime of the reference is the range of code where it is valid, not the range of code where the reference variable <code>r</code> exists. When the underlying value <code>s</code> is dropped, any reference to it becomes invalid, regardless of whether <code>r</code> itself is still in scope.</p>
`
  },

});
