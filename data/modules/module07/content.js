/* ================================================================
   Module 7: Traits, Generics & Type System
   Chapters: 41 - 47  (all complete)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 41: Generics
     --------------------------------------------------------------- */
  'ch41': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 41,
    title: 'Generics',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 41</span>
</div>

<h1>Generics: Writing Code That Works for Any Type</h1>

<p>Imagine you write a function to find the largest number in a list of integers. Then a colleague asks for the same function for floating-point numbers. Then for strings. Without generics, you copy and paste the same logic three times, changing only the type. Generics let you write that logic once and have the compiler produce the correct version for every type you actually use.</p>

<h2>The Stencil Analogy</h2>

<p>Think of a generic function like a stencil. The stencil defines a shape: it does not care whether you paint it in red, blue, or green. When you use the stencil, you pick a color and paint. The result is a complete shape in your chosen color. Generics work the same way: you define the logic once, and the compiler "paints" it in every concrete type you use. The output is as specific and efficient as if you had written each version by hand.</p>

<h2>The Problem Generics Solve</h2>

<p>Here is the same function written twice for two different types. The bodies are identical:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn largest_i32(list: &amp;[i32]) -&gt; &amp;i32 {
    let mut largest = &amp;list[0];
    for item in list {
        if item &gt; largest { largest = item; }
    }
    largest
}

fn largest_f64(list: &amp;[f64]) -&gt; &amp;f64 {
    let mut largest = &amp;list[0];
    for item in list {
        if item &gt; largest { largest = item; }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("largest i32: {}", largest_i32(&amp;numbers));

    let floats = vec![34.0, 50.0, 25.0, 100.0];
    println!("largest f64: {}", largest_f64(&amp;floats));
}</code></pre>
</div>

<p>This duplication is a maintenance problem: any bug fix or improvement must be made in every copy. Generics eliminate the duplication.</p>

<h2>Generic Functions</h2>

<p>A generic function declares a type parameter in angle brackets after the function name. By convention, single uppercase letters like <code>T</code> are used, but any name works:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// T must implement PartialOrd so we can compare values.
fn largest&lt;T: std::cmp::PartialOrd&gt;(list: &amp;[T]) -&gt; &amp;T {
    let mut largest = &amp;list[0];
    for item in list {
        if item &gt; largest { largest = item; }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("largest: {}", largest(&amp;numbers)); // 100

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("largest: {}", largest(&amp;chars));   // y
}</code></pre>
</div>

<pre class="output"><code>largest: 100
largest: y</code></pre>

<p>One function, two types, zero duplication. The <code>PartialOrd</code> constraint (covered in depth in the next chapter on trait bounds) tells the compiler that <code>T</code> must support the <code>&gt;</code> comparison operator.</p>

<h2>Generic Structs</h2>

<p>Structs can also have generic type parameters. Use one parameter when all fields should be the same type, two when they can differ:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Both x and y must be the same type T.
struct Point&lt;T&gt; {
    x: T,
    y: T,
}

fn main() {
    let integer_point = Point { x: 5, y: 10 };    // Point&lt;i32&gt;
    let float_point   = Point { x: 1.0, y: 4.5 }; // Point&lt;f64&gt;

    // This would NOT compile: x and y have different types
    // let bad = Point { x: 5, y: 4.0 }; // error: mismatched types
    println!("({}, {})", integer_point.x, integer_point.y);
}</code></pre>
</div>

<pre class="output"><code>(5, 10)</code></pre>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Two separate type parameters allow x and y to differ.
struct Point&lt;T, U&gt; {
    x: T,
    y: U,
}

fn main() {
    let mixed = Point { x: 5, y: 4.0 }; // Point&lt;i32, f64&gt;
    println!("({}, {})", mixed.x, mixed.y);
}</code></pre>
</div>

<pre class="output"><code>(5, 4)</code></pre>

<h2>Generic Enums</h2>

<p>You have already used generic enums. The standard library defines <code>Option</code> and <code>Result</code> exactly this way:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// From the standard library:
enum Option&lt;T&gt; {
    Some(T),
    None,
}

enum Result&lt;T, E&gt; {
    Ok(T),
    Err(E),
}

// Your own generic enum:
#[derive(Debug)]
enum Either&lt;L, R&gt; {
    Left(L),
    Right(R),
}

fn main() {
    let a: Either&lt;i32, &amp;str&gt; = Either::Left(42);
    let b: Either&lt;i32, &amp;str&gt; = Either::Right("hello");
    println!("{:?}", a); // Left(42)
    println!("{:?}", b); // Right("hello")
}</code></pre>
</div>

<pre class="output"><code>Left(42)
Right("hello")</code></pre>

<h2>Generic Methods on Generic Structs</h2>

<p>When you implement methods on a generic struct, declare the type parameter after <code>impl</code> and also after the struct name:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Point&lt;T&gt; {
    x: T,
    y: T,
}

// impl&lt;T&gt; means: "for any type T, implement these methods on Point&lt;T&gt;"
impl&lt;T&gt; Point&lt;T&gt; {
    fn x(&amp;self) -&gt; &amp;T {
        &amp;self.x
    }
    fn y(&amp;self) -&gt; &amp;T {
        &amp;self.y
    }
}

// A method only for Point&lt;f64&gt; — not available on Point&lt;i32&gt;
impl Point&lt;f64&gt; {
    fn distance_from_origin(&amp;self) -&gt; f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let p = Point { x: 3.0_f64, y: 4.0 };
    println!("x = {}", p.x());
    println!("distance from origin = {}", p.distance_from_origin()); // 5.0
}</code></pre>
</div>

<pre class="output"><code>x = 3
distance from origin = 5</code></pre>

<h2>Monomorphization: Zero Runtime Cost</h2>

<p>Generics in Rust have <strong>no runtime performance cost</strong>. The compiler performs <em>monomorphization</em>: it reads your generic code and generates a separate concrete version for each type you actually use. The result is exactly as fast as if you had written each version by hand.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // You write this:
    let integer = Some(5);
    let float   = Some(5.0);
}

// The compiler generates code equivalent to this:
// enum Option_i32 { Some(i32), None }
// enum Option_f64 { Some(f64), None }
// let integer = Option_i32::Some(5);
// let float   = Option_f64::Some(5.0);</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Monomorphization means you pay for generics at compile time (slightly longer build times) rather than at runtime (slower execution). This is a deliberate trade-off in Rust's design: fast binaries, not fast builds.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using a Generic Type Without the Required Trait Bound</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: T might not support the &gt; operator
fn largest&lt;T&gt;(list: &amp;[T]) -&gt; &amp;T {
    let mut largest = &amp;list[0];
    for item in list {
        if item &gt; largest { largest = item; } // error: binary operation not supported for T
    }
    largest
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: constrain T to types that support comparison
fn largest&lt;T: std::cmp::PartialOrd&gt;(list: &amp;[T]) -&gt; &amp;T {
    let mut largest = &amp;list[0];
    for item in list {
        if item &gt; largest { largest = item; }
    }
    largest
}</code></pre>
</div>

<h3>Mistake 2: Forgetting &lt;T&gt; After impl When Implementing Generic Structs</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Wrapper&lt;T&gt; { value: T }

// BROKEN: missing &lt;T&gt; after impl — treats T as a concrete type name
impl Wrapper&lt;T&gt; {       // error: cannot find type T
    fn get(&amp;self) -&gt; &amp;T { &amp;self.value }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: declare T after impl
impl&lt;T&gt; Wrapper&lt;T&gt; {
    fn get(&amp;self) -&gt; &amp;T { &amp;self.value }
}</code></pre>
</div>

<h3>Mistake 3: Mixing Types in a Single-Parameter Generic Struct</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Pair&lt;T&gt; { first: T, second: T }

// BROKEN: both fields must be the same type T
let bad = Pair { first: 1, second: "hello" }; // error: mismatched types</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use two type parameters if the fields can differ
struct Pair&lt;T, U&gt; { first: T, second: U }

let good = Pair { first: 1, second: "hello" }; // Pair&lt;i32, &amp;str&gt;</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 42: Trait Definitions
     --------------------------------------------------------------- */
  'ch42': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 42,
    title: 'Trait Definitions',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 42</span>
</div>

<h1>Trait Definitions: Shared Behavior Across Types</h1>

<p>A <strong>trait</strong> defines a set of methods that a type must provide in order to claim a certain capability. Traits are how Rust describes shared behavior: different types can implement the same trait and be used interchangeably by any code that only cares about that capability, not the specific type.</p>

<h2>The Job Description Analogy</h2>

<p>Think of a trait like a job description. "Software Engineer" does not describe a specific person: it describes a set of capabilities (writes code, reviews PRs, debugs systems). Many different people can be a Software Engineer, and any code that needs a "Software Engineer" can work with any of them. Similarly, a Rust trait describes a set of capabilities that many different types can implement. Code that needs those capabilities can accept any type that implements the trait.</p>

<h2>Defining a Trait</h2>

<p>Use the <code>trait</code> keyword, a name, and method signatures inside curly braces. Method signatures end with a semicolon: the implementing types will fill in the actual body:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

pub trait Greet {
    fn hello(&amp;self) -&gt; String;
    fn goodbye(&amp;self) -&gt; String;
}</code></pre>
</div>

<p>A trait can declare as many methods as needed. Every type that implements the trait must provide a body for each method that has no default.</p>

<h2>Implementing a Trait on a Type</h2>

<p>Use the syntax <code>impl TraitName for TypeName</code>. The block must contain a body for every method the trait requires:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

pub struct NewsArticle {
    pub headline: String,
    pub author:   String,
    pub location: String,
}

pub struct SocialPost {
    pub username: String,
    pub content:  String,
}

impl Summary for NewsArticle {
    fn summarize(&amp;self) -&gt; String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

impl Summary for SocialPost {
    fn summarize(&amp;self) -&gt; String {
        format!("{}: {}", self.username, self.content)
    }
}

fn main() {
    let article = NewsArticle {
        headline: String::from("Rust 2.0 Released"),
        author:   String::from("Jane Dev"),
        location: String::from("San Francisco"),
    };

    let post = SocialPost {
        username: String::from("rustacean"),
        content:  String::from("Loving the borrow checker today."),
    };

    println!("{}", article.summarize());
    println!("{}", post.summarize());
}</code></pre>
</div>

<pre class="output"><code>Rust 2.0 Released, by Jane Dev (San Francisco)
rustacean: Loving the borrow checker today.</code></pre>

<h2>Default Implementations</h2>

<p>A trait can provide a default body for any of its methods. Types that implement the trait can use the default or override it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String {
        String::from("(Read more...)")
    }
}

pub struct NewsArticle {
    pub headline: String,
}

// Empty impl block: NewsArticle uses the default implementation
impl Summary for NewsArticle {}

pub struct SocialPost {
    pub username: String,
    pub content: String,
}

// SocialPost overrides the default with its own implementation
impl Summary for SocialPost {
    fn summarize(&amp;self) -&gt; String {
        format!("{}: {}", self.username, self.content)
    }
}

fn main() {
    let article = NewsArticle { headline: String::from("Big News!") };
    let post    = SocialPost  { username: String::from("alice"), content: String::from("hello") };

    println!("{}", article.summarize()); // (Read more...)
    println!("{}", post.summarize());    // alice: hello
}</code></pre>
</div>

<pre class="output"><code>(Read more...)
alice: hello</code></pre>

<h2>Default Methods Calling Required Methods</h2>

<p>A default implementation can call other methods in the same trait, even required ones. This lets you provide useful default behavior built on top of a minimal required interface:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    // Required: implementing types must define this.
    fn summarize_author(&amp;self) -&gt; String;

    // Default: calls the required method above.
    fn summarize(&amp;self) -&gt; String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

pub struct SocialPost {
    pub username: String,
    pub content: String,
}

impl Summary for SocialPost {
    // Only summarize_author is required — summarize comes for free.
    fn summarize_author(&amp;self) -&gt; String {
        format!("@{}", self.username)
    }
}

fn main() {
    let post = SocialPost {
        username: String::from("horse_ebooks"),
        content:  String::from("of course, as you probably know"),
    };
    println!("{}", post.summarize()); // (Read more from @horse_ebooks...)
}</code></pre>
</div>

<pre class="output"><code>(Read more from @horse_ebooks...)</code></pre>

<h2>The Orphan Rule</h2>

<p>You can implement a trait on a type only if at least one of them is defined in your crate. This is called the <strong>orphan rule</strong> (or coherence rule). It prevents two separate libraries from implementing the same trait on the same type in conflicting ways:</p>

<dl>
  <dt>Allowed: your trait on an external type</dt>
  <dd><code>impl Summary for Vec&lt;String&gt;</code> where <code>Summary</code> is your trait and <code>Vec</code> is from the standard library.</dd>
  <dt>Allowed: external trait on your type</dt>
  <dd><code>impl Display for MyStruct</code> where <code>Display</code> is from <code>std::fmt</code> and <code>MyStruct</code> is yours.</dd>
  <dt>Not allowed: external trait on external type</dt>
  <dd><code>impl Display for Vec&lt;String&gt;</code> would be rejected: both <code>Display</code> and <code>Vec</code> are external.</dd>
</dl>

<h2>The Self Type in Traits</h2>

<p><code>Self</code> (capital S) inside a trait refers to the type that is implementing the trait. This is useful for methods that construct or return a value of the implementing type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Animal {
    fn new(name: &amp;str) -&gt; Self; // returns the implementing type itself
    fn name(&amp;self) -&gt; &amp;str;
    fn sound(&amp;self) -&gt; &amp;str;

    fn describe(&amp;self) -&gt; String {
        format!("{} says {}", self.name(), self.sound())
    }
}

struct Dog { name: String }
struct Cat { name: String }

impl Animal for Dog {
    fn new(name: &amp;str) -&gt; Self { Dog { name: name.to_string() } }
    fn name(&amp;self) -&gt; &amp;str   { &amp;self.name }
    fn sound(&amp;self) -&gt; &amp;str  { "woof" }
}

impl Animal for Cat {
    fn new(name: &amp;str) -&gt; Self { Cat { name: name.to_string() } }
    fn name(&amp;self) -&gt; &amp;str   { &amp;self.name }
    fn sound(&amp;self) -&gt; &amp;str  { "meow" }
}

fn main() {
    let dog = Dog::new("Rex");
    let cat = Cat::new("Whiskers");
    println!("{}", dog.describe()); // Rex says woof
    println!("{}", cat.describe()); // Whiskers says meow
}</code></pre>
</div>

<pre class="output"><code>Rex says woof
Whiskers says meow</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Implementing a Method Without Matching the Trait Signature</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

struct Post { title: String }

// BROKEN: wrong return type (returns &str, trait requires String)
impl Summary for Post {
    fn summarize(&amp;self) -&gt; &amp;str { // error: method type mismatch
        &amp;self.title
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: match the exact signature from the trait
impl Summary for Post {
    fn summarize(&amp;self) -&gt; String {
        self.title.clone()
    }
}</code></pre>
</div>

<h3>Mistake 2: Trying to Implement an External Trait on an External Type</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

// BROKEN: both Display and Vec are external to your crate
impl fmt::Display for Vec&lt;String&gt; { // error: orphan rule violation
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "{:?}", self)
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: wrap the external type in a newtype, then implement Display on it
use std::fmt;

struct MyVec(Vec&lt;String&gt;); // your type wrapping Vec

impl fmt::Display for MyVec {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let v = MyVec(vec![String::from("a"), String::from("b")]);
    println!("{}", v); // [a, b]
}</code></pre>
</div>

<h3>Mistake 3: Calling the Default from an Overriding Method</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Greet {
    fn hello(&amp;self) -&gt; String {
        String::from("Hello!")
    }
}

struct Polite;

impl Greet for Polite {
    fn hello(&amp;self) -&gt; String {
        // BROKEN: you cannot call the default implementation from inside the override
        let base = Greet::hello(self); // this calls itself, causing infinite recursion
        format!("{} How do you do?", base)
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: write the base text directly, or use a helper method
impl Greet for Polite {
    fn hello(&amp;self) -&gt; String {
        String::from("Hello! How do you do?")
    }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 43: Trait Bounds
     --------------------------------------------------------------- */
  'ch43': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 43,
    title: 'Trait Bounds',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 43</span>
</div>

<h1>Trait Bounds: Constraining Generic Types</h1>

<p>A generic type parameter <code>T</code> by itself means "any type at all." That is very flexible, but too flexible: if any type is allowed, you cannot call any methods on it (since not all types have every method). A <strong>trait bound</strong> narrows the allowed types to those that implement specific capabilities, giving you access to that capability's methods inside the generic function or struct.</p>

<h2>The Job Requirements Analogy</h2>

<p>Posting "any person" for a job opening would give you the world's population to choose from, but the hire might not know how to do the job. A job posting that says "any person who can write Rust and read Spanish" constrains the pool to only candidates with those capabilities. You gain the ability to assign tasks requiring Rust and Spanish without checking whether each person can do them. Trait bounds work the same way: constraining <code>T</code> to types that implement <code>Summary + Display</code> lets you call <code>summarize()</code> and <code>println!("{}", item)</code> on <code>item</code> without any runtime checks.</p>

<h2>The impl Trait Syntax (Simple Shorthand)</h2>

<p>The quickest way to say "this parameter must implement a certain trait" is <code>impl TraitName</code> directly in the parameter position:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

pub struct Article { pub headline: String, pub author: String }
pub struct Tweet   { pub username: String, pub content: String }

impl Summary for Article {
    fn summarize(&amp;self) -&gt; String {
        format!("{} by {}", self.headline, self.author)
    }
}
impl Summary for Tweet {
    fn summarize(&amp;self) -&gt; String {
        format!("{}: {}", self.username, self.content)
    }
}

// Accepts any type that implements Summary.
fn notify(item: &amp;impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

fn main() {
    let a = Article { headline: String::from("Rust hits 2.0"), author: String::from("Dev") };
    let t = Tweet   { username: String::from("alice"), content: String::from("hello!") };
    notify(&amp;a);
    notify(&amp;t);
}</code></pre>
</div>

<pre class="output"><code>Breaking news! Rust hits 2.0 by Dev
Breaking news! alice: hello!</code></pre>

<h2>The Trait Bound Syntax (Long Form)</h2>

<p>The <code>impl Trait</code> shorthand is syntax sugar for the longer trait bound form. When you need more control, use the long form explicitly:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// These two are exactly equivalent:
fn notify_short(item: &amp;impl Summary) { }
fn notify_long&lt;T: Summary&gt;(item: &amp;T) { }

// The long form is required when forcing two parameters to be the SAME type:
fn compare_same&lt;T: Summary&gt;(a: &amp;T, b: &amp;T) { }
// With impl Trait, a and b could be different types:
fn compare_any(a: &amp;impl Summary, b: &amp;impl Summary) { }</code></pre>
</div>

<h2>Multiple Trait Bounds with +</h2>

<p>Require a type to implement multiple traits using the <code>+</code> syntax:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

// T must implement both Summary and Debug.
fn notify_debug&lt;T: Summary + fmt::Debug&gt;(item: &amp;T) {
    println!("debug:   {:?}", item);
    println!("summary: {}", item.summarize());
}

// Shorthand form:
fn notify_debug_short(item: &amp;(impl Summary + fmt::Debug)) { }</code></pre>
</div>

<h2>The where Clause for Readability</h2>

<p>When a function has many type parameters and bounds, putting them all in the angle brackets makes the signature hard to read. A <code>where</code> clause moves the bounds to a separate, cleaner block:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

// Hard to read: bounds crammed into the angle brackets
fn compare&lt;T: fmt::Display + PartialOrd, U: fmt::Debug + Clone&gt;(t: &amp;T, u: &amp;U) -&gt; String {
    format!("{} vs {:?}", t, u)
}

// Same thing with a where clause — much easier to read
fn compare_clean&lt;T, U&gt;(t: &amp;T, u: &amp;U) -&gt; String
where
    T: fmt::Display + PartialOrd,
    U: fmt::Debug + Clone,
{
    format!("{} vs {:?}", t, u)
}

fn main() {
    println!("{}", compare_clean(&amp;42, &amp;vec![1, 2, 3]));
}</code></pre>
</div>

<pre class="output"><code>42 vs [1, 2, 3]</code></pre>

<h2>Returning impl Trait</h2>

<p>You can use <code>impl Trait</code> in the return position to say "this function returns some type that implements this trait" without naming the exact type. This is useful for hiding implementation details:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary {
    fn summarize(&amp;self) -&gt; String;
}

pub struct Tweet { pub username: String, pub content: String }

impl Summary for Tweet {
    fn summarize(&amp;self) -&gt; String {
        format!("{}: {}", self.username, self.content)
    }
}

// Callers know the return type implements Summary, but not that it is a Tweet.
fn make_tweet() -&gt; impl Summary {
    Tweet {
        username: String::from("rustbot"),
        content:  String::from("cargo build --release"),
    }
}

fn main() {
    let item = make_tweet();
    println!("{}", item.summarize());
}</code></pre>
</div>

<pre class="output"><code>rustbot: cargo build --release</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>impl Trait</code> in the return position only works when the function returns exactly one concrete type. If a function could return a <code>Tweet</code> or an <code>Article</code> depending on a condition, <code>impl Trait</code> does not work. You need a trait object (<code>Box&lt;dyn Trait&gt;</code>) for that, which is covered in Chapter 45.</p>
</div>

<h2>Conditional Method Implementation</h2>

<p>You can implement methods on a generic struct only for those type parameters that satisfy certain bounds. The method simply does not exist for types that do not meet the requirement:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

struct Pair&lt;T&gt; {
    x: T,
    y: T,
}

impl&lt;T&gt; Pair&lt;T&gt; {
    fn new(x: T, y: T) -&gt; Self {
        Self { x, y }
    }
}

// cmp_display is only available when T implements both Display and PartialOrd.
impl&lt;T: fmt::Display + PartialOrd&gt; Pair&lt;T&gt; {
    fn cmp_display(&amp;self) {
        if self.x &gt;= self.y {
            println!("Largest: x = {}", self.x);
        } else {
            println!("Largest: y = {}", self.y);
        }
    }
}

fn main() {
    let pair = Pair::new(5, 10);
    pair.cmp_display(); // Largest: y = 10

    // Pair::new(vec![1], vec![2]).cmp_display(); // would not compile: Vec is not Display
}</code></pre>
</div>

<pre class="output"><code>Largest: y = 10</code></pre>

<h2>Blanket Implementations</h2>

<p>A blanket implementation applies a trait to every type that satisfies another bound. The standard library uses this extensively. For example, <code>ToString</code> is implemented for any type that implements <code>Display</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This is how the standard library implements ToString for free:
// impl&lt;T: fmt::Display&gt; ToString for T { ... }

// Because i32 implements Display, it automatically gets to_string():
fn main() {
    let s: String = 42.to_string();
    println!("{}", s); // "42"

    let pi: String = 3.14_f64.to_string();
    println!("{}", pi); // "3.14"
}</code></pre>
</div>

<pre class="output"><code>42
3.14</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using impl Trait When Both Parameters Must Be the Same Concrete Type</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary { fn summarize(&amp;self) -&gt; String; }

// MISLEADING: a and b can be DIFFERENT types that both implement Summary
fn compare(a: &amp;impl Summary, b: &amp;impl Summary) { }</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CORRECT: T: Summary enforces that a and b are the same concrete type
fn compare&lt;T: Summary&gt;(a: &amp;T, b: &amp;T) { }</code></pre>
</div>

<h3>Mistake 2: Trying to Return Different Types With impl Trait</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary { fn summarize(&amp;self) -&gt; String; }
struct Article; struct Tweet;
impl Summary for Article { fn summarize(&amp;self) -&gt; String { String::from("article") } }
impl Summary for Tweet   { fn summarize(&amp;self) -&gt; String { String::from("tweet") } }

// BROKEN: impl Trait can only resolve to one concrete type per function
fn make(use_article: bool) -&gt; impl Summary {
    if use_article { Article } else { Tweet } // error: mismatched types
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use a trait object for runtime type selection (see Chapter 45)
fn make(use_article: bool) -&gt; Box&lt;dyn Summary&gt; {
    if use_article { Box::new(Article) } else { Box::new(Tweet) }
}</code></pre>
</div>

<h3>Mistake 3: Forgetting That Trait Methods Are Only Callable When the Bound Is in Scope</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// In a different module, Summary is defined but not imported.
// BROKEN: summarize() is not callable without the Summary trait in scope
fn print_summary&lt;T&gt;(item: &amp;T)
where T: crate::Summary
{
    println!("{}", item.summarize()); // works here — trait is in the where clause
}

// But if a caller just does item.summarize() on a concrete type without
// the trait in scope, it still fails:
// use mylib::Article; // but not Summary
// article.summarize(); // error: method not found</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: always bring the trait into scope when using its methods
use mylib::{Article, Summary}; // import both the type AND the trait</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 44: Associated Types
     --------------------------------------------------------------- */
  'ch44': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 44,
    title: 'Associated Types',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 44</span>
</div>

<h1>Associated Types: Named Type Slots in Traits</h1>

<p>An <strong>associated type</strong> is a type placeholder that is part of a trait's definition. Instead of the trait being generic over that type (which would allow multiple implementations), the associated type is fixed to one concrete type per implementation. This makes the trait easier to use: callers do not need to specify the type, the implementing type has already decided it.</p>

<h2>The Named Slot Analogy</h2>

<p>Think of a recipe card with a slot labeled "Main Protein." The recipe does not care which protein you use: chicken, tofu, or beef all work. But once you decide, every step in the recipe refers to "the Main Protein" without you having to repeat your choice at every step. An associated type is that named slot: the trait defines a placeholder (<code>type Item</code>), and each implementation fills in exactly one concrete type for it. After that, every method in the trait can use <code>Self::Item</code> and know it is consistently the same type for that implementation.</p>

<h2>The Iterator Trait: A Real Example</h2>

<p>The most important use of associated types in the standard library is the <code>Iterator</code> trait. Every iterator has an element type, and every method on the iterator works with that element type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Simplified version of what the standard library defines:
pub trait Iterator {
    type Item; // the associated type — each implementor fills this in

    fn next(&amp;mut self) -&gt; Option&lt;Self::Item&gt;;
    // All other Iterator methods use Self::Item consistently
}</code></pre>
</div>

<p>The key word is <code>type Item</code>: a named placeholder. When you implement <code>Iterator</code>, you choose what <code>Item</code> means for your type, and every method can then use <code>Self::Item</code> to refer to it.</p>

<h2>Implementing Iterator with an Associated Type</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Counter {
    count: u32,
    max: u32,
}

impl Counter {
    fn new(max: u32) -&gt; Self {
        Counter { count: 0, max }
    }
}

impl Iterator for Counter {
    type Item = u32; // fill in the associated type: this iterator yields u32 values

    fn next(&amp;mut self) -&gt; Option&lt;Self::Item&gt; {
        if self.count &lt; self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

fn main() {
    let counter = Counter::new(5);

    // Iterator methods like collect, sum, map all work because Item is u32
    let values: Vec&lt;u32&gt; = counter.collect();
    println!("{:?}", values); // [1, 2, 3, 4, 5]

    let total: u32 = Counter::new(5).sum();
    println!("sum = {}", total); // 15
}</code></pre>
</div>

<pre class="output"><code>[1, 2, 3, 4, 5]
sum = 15</code></pre>

<h2>Why Associated Types Instead of Generics?</h2>

<p>This is the key question. Here is the same <code>Iterator</code> written with a generic type parameter instead of an associated type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Hypothetical: Iterator written with a generic parameter instead
pub trait IteratorG&lt;Item&gt; {
    fn next(&amp;mut self) -&gt; Option&lt;Item&gt;;
}

// Problem: Counter could now implement IteratorG multiple times
// with different item types — which is confusing and often meaningless:
impl IteratorG&lt;u32&gt; for Counter {
    fn next(&amp;mut self) -&gt; Option&lt;u32&gt; { todo!() }
}
impl IteratorG&lt;String&gt; for Counter {
    fn next(&amp;mut self) -&gt; Option&lt;String&gt; { todo!() }
}
// Which one do you get when you call .next()? Ambiguous!

// With an associated type, Counter can only implement Iterator ONCE.
// The type of Item is determined once, and there is no ambiguity.</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Rule of thumb: use an associated type when there is only one sensible choice for the type per implementation. Use a generic parameter when the same type can meaningfully implement the trait with multiple different type arguments (for example, <code>From&lt;T&gt;</code>: a type can implement <code>From&lt;String&gt;</code> and <code>From&lt;i32&gt;</code> independently).</p>
</div>

<h2>Defining Your Own Trait with an Associated Type</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// A trait that converts Self into some target type.
pub trait Convert {
    type Output; // the associated output type

    fn convert(&amp;self) -&gt; Self::Output;
}

struct Celsius(f64);
struct Fahrenheit(f64);

impl Convert for Celsius {
    type Output = Fahrenheit; // Celsius converts to Fahrenheit

    fn convert(&amp;self) -&gt; Fahrenheit {
        Fahrenheit(self.0 * 9.0 / 5.0 + 32.0)
    }
}

struct Meters(f64);
struct Feet(f64);

impl Convert for Meters {
    type Output = Feet; // Meters converts to Feet

    fn convert(&amp;self) -&gt; Feet {
        Feet(self.0 * 3.28084)
    }
}

fn main() {
    let boiling  = Celsius(100.0);
    let in_f = boiling.convert();
    println!("100 C = {} F", in_f.0); // 212 F

    let marathon = Meters(42195.0);
    let in_feet = marathon.convert();
    println!("Marathon = {:.0} feet", in_feet.0); // 138435 feet
}</code></pre>
</div>

<pre class="output"><code>100 C = 212 F
Marathon = 138435 feet</code></pre>

<h2>Using the Associated Type in Trait Bounds</h2>

<p>When you write a function that accepts any type implementing a trait with an associated type, you can refer to the associated type through the trait:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

fn print_next&lt;I&gt;(iter: &amp;mut I)
where
    I: Iterator,
    I::Item: fmt::Debug, // the associated Item type must be Debug
{
    match iter.next() {
        Some(val) =&gt; println!("{:?}", val),
        None      =&gt; println!("(empty)"),
    }
}

fn main() {
    let mut v = vec![10, 20, 30].into_iter();
    print_next(&amp;mut v); // 10
    print_next(&amp;mut v); // 20
}</code></pre>
</div>

<pre class="output"><code>10
20</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Implementing the Same Trait Twice With Different Associated Types</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Convert {
    type Output;
    fn convert(&amp;self) -&gt; Self::Output;
}

struct Temperature(f64);

// BROKEN: you cannot implement Convert twice for the same type —
// associated types can only be set once per implementation
impl Convert for Temperature {
    type Output = f64;
    fn convert(&amp;self) -&gt; f64 { self.0 * 1.8 + 32.0 }
}
// impl Convert for Temperature { // error: conflicting implementations
//     type Output = i64;
//     fn convert(&amp;self) -&gt; i64 { self.0 as i64 }
// }</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use a generic parameter if you need multiple conversions
pub trait ConvertTo&lt;T&gt; {
    fn convert_to(&amp;self) -&gt; T;
}

struct Temperature(f64);

impl ConvertTo&lt;f64&gt; for Temperature {
    fn convert_to(&amp;self) -&gt; f64 { self.0 * 1.8 + 32.0 }
}
impl ConvertTo&lt;i64&gt; for Temperature {
    fn convert_to(&amp;self) -&gt; i64 { self.0 as i64 }
}</code></pre>
</div>

<h3>Mistake 2: Forgetting to Specify the Associated Type in the impl Block</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Convert { type Output; fn convert(&amp;self) -&gt; Self::Output; }
struct Meter(f64);

// BROKEN: missing the type Output = ... line
impl Convert for Meter {
    // error: not all trait items implemented, missing: Output
    fn convert(&amp;self) -&gt; Self::Output { self.0 * 3.28084 }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: always specify the associated type inside the impl block
impl Convert for Meter {
    type Output = f64; // required
    fn convert(&amp;self) -&gt; f64 { self.0 * 3.28084 }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 45: Trait Objects
     --------------------------------------------------------------- */
  'ch45': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 45,
    title: 'Trait Objects',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 45</span>
</div>

<h1>Trait Objects: Different Types Behind One Pointer</h1>

<p>Generics with trait bounds let you write one function that works for many types, but at compile time each generic call is tied to exactly one concrete type. Sometimes you genuinely do not know the concrete type until runtime, or you need a single data structure (like a <code>Vec</code>) to hold values of different types that all share a common interface. That is where <strong>trait objects</strong> come in.</p>

<h2>The Power Strip Analogy</h2>

<p>A power strip does not care what you plug into it: a lamp, a phone charger, a laptop, or a fan. All it requires is that the plug fits the socket. The power strip holds different kinds of devices in the same strip. Trait objects are that power strip. A <code>Vec&lt;Box&lt;dyn Draw&gt;&gt;</code> can hold a <code>Button</code>, a <code>TextBox</code>, and a <code>Checkbox</code> side by side, as long as each implements the <code>Draw</code> trait. The vector does not know or care which specific type each element is: it only knows they all know how to draw.</p>

<h2>Creating a Trait Object</h2>

<p>A trait object is created by combining a pointer (a reference or a <code>Box</code>) with the <code>dyn</code> keyword and a trait name:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">&amp;dyn TraitName       // borrowed trait object (reference)
Box&lt;dyn TraitName&gt;   // owned trait object (heap-allocated)</code></pre>
</div>

<h2>A Complete Example: A GUI Drawing System</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Draw {
    fn draw(&amp;self);
}

pub struct Button {
    pub width:  u32,
    pub height: u32,
    pub label:  String,
}

pub struct Image {
    pub src: String,
}

pub struct TextBox {
    pub placeholder: String,
}

impl Draw for Button {
    fn draw(&amp;self) {
        println!("Drawing button [{}x{}]: '{}'", self.width, self.height, self.label);
    }
}

impl Draw for Image {
    fn draw(&amp;self) {
        println!("Drawing image: {}", self.src);
    }
}

impl Draw for TextBox {
    fn draw(&amp;self) {
        println!("Drawing text box: '{}'", self.placeholder);
    }
}

// Screen holds a Vec of trait objects — different types, same interface
pub struct Screen {
    pub components: Vec&lt;Box&lt;dyn Draw&gt;&gt;,
}

impl Screen {
    pub fn render(&amp;self) {
        for component in &amp;self.components {
            component.draw(); // called on whatever type is actually there
        }
    }
}

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(Button  { width: 50, height: 10, label: String::from("OK") }),
            Box::new(Image   { src: String::from("logo.png") }),
            Box::new(TextBox { placeholder: String::from("Search...") }),
        ],
    };

    screen.render();
}</code></pre>
</div>

<pre class="output"><code>Drawing button [50x10]: 'OK'
Drawing image: logo.png
Drawing text box: 'Search...'</code></pre>

<p>The <code>Vec&lt;Box&lt;dyn Draw&gt;&gt;</code> holds three values of completely different types. None of this is possible with generics: a <code>Vec&lt;T&gt;</code> where <code>T: Draw</code> would require all elements to be the same type.</p>

<h2>Trait Objects vs Generic Trait Bounds: The Key Difference</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Draw { fn draw(&amp;self); }

// GENERIC approach: all components must be the SAME concrete type T
pub struct GenericScreen&lt;T: Draw&gt; {
    pub components: Vec&lt;T&gt;, // Vec&lt;Button&gt; OR Vec&lt;Image&gt; — not both
}

// TRAIT OBJECT approach: components can be any mix of types implementing Draw
pub struct DynamicScreen {
    pub components: Vec&lt;Box&lt;dyn Draw&gt;&gt;, // Button AND Image AND TextBox together
}</code></pre>
</div>

<dl>
  <dt>Use generics (<code>T: Draw</code>) when</dt>
  <dd>Your collection will always contain one specific type. The compiler can optimize the code via monomorphization, making it faster.</dd>
  <dt>Use trait objects (<code>dyn Draw</code>) when</dt>
  <dd>Your collection needs to hold different types at runtime, or when the types are not known until the user provides them (plugin systems, GUI widgets, game entities).</dd>
</dl>

<h2>Object Safety</h2>

<p>Not every trait can be used as a trait object. A trait is <strong>object-safe</strong> if all its methods meet two rules:</p>

<ol>
  <li>The return type is not <code>Self</code>.</li>
  <li>There are no generic type parameters on the methods.</li>
</ol>

<p>These rules exist because when using a trait object, the concrete type is erased at compile time. If a method returns <code>Self</code>, the compiler cannot know what type to produce. If a method has generic parameters, it cannot generate the right version without knowing the concrete type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Object-SAFE trait: no Self return, no generic methods
pub trait Draw {
    fn draw(&amp;self);
}

// NOT object-safe: clone() returns Self
// pub trait Clone { fn clone(&amp;self) -&gt; Self; }
// Box&lt;dyn Clone&gt; would be a compile error

// NOT object-safe: generic method parameter
// pub trait Converter {
//     fn convert&lt;T&gt;(&amp;self) -&gt; T; // T is generic — not object-safe
// }</code></pre>
</div>

<h2>Using Trait Objects With References</h2>

<p>You do not always need to heap-allocate with <code>Box</code>. A borrowed trait object using a reference works when you only need to use the value temporarily:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Speak {
    fn speak(&amp;self) -&gt; &amp;str;
}

struct Dog;
struct Cat;

impl Speak for Dog { fn speak(&amp;self) -&gt; &amp;str { "Woof!" } }
impl Speak for Cat { fn speak(&amp;self) -&gt; &amp;str { "Meow!" } }

fn make_noise(animal: &amp;dyn Speak) {
    println!("{}", animal.speak());
}

fn main() {
    let dog = Dog;
    let cat = Cat;

    make_noise(&amp;dog); // Woof!
    make_noise(&amp;cat); // Meow!

    // You can also store borrowed trait objects temporarily
    let animals: Vec&lt;&amp;dyn Speak&gt; = vec![&amp;dog, &amp;cat];
    for a in &amp;animals {
        println!("{}", a.speak());
    }
}</code></pre>
</div>

<pre class="output"><code>Woof!
Meow!
Woof!
Meow!</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Trying to Use a Non-Object-Safe Trait as a Trait Object</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: Clone returns Self, making it not object-safe
fn duplicate(items: Vec&lt;Box&lt;dyn Clone&gt;&gt;) { // error: Clone is not dyn compatible
    // ...
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: define your own object-safe trait that does what you need
pub trait Cloneable {
    fn clone_box(&amp;self) -&gt; Box&lt;dyn Cloneable&gt;;
}

// Or restructure so you do not need a collection of different cloneable types</code></pre>
</div>

<h3>Mistake 2: Forgetting Box When Storing Trait Objects in a Vec</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Draw { fn draw(&amp;self); }
struct Button;
impl Draw for Button { fn draw(&amp;self) {} }

// BROKEN: Vec elements must have a known size; dyn Draw does not
let components: Vec&lt;dyn Draw&gt; = vec![Button]; // error: dyn Draw has unknown size</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: wrap in Box to give the trait object a known pointer size
let components: Vec&lt;Box&lt;dyn Draw&gt;&gt; = vec![Box::new(Button)];
// OR use references with a lifetime:
let btn = Button;
let components: Vec&lt;&amp;dyn Draw&gt; = vec![&amp;btn];</code></pre>
</div>

<h3>Mistake 3: Using Trait Objects When All Types Are Known at Compile Time</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Summary { fn summarize(&amp;self) -&gt; String; }
struct Article;
impl Summary for Article { fn summarize(&amp;self) -&gt; String { String::from("news") } }

// UNNECESSARY: if you always pass exactly one type, a generic is faster
fn print_all(items: &amp;[Box&lt;dyn Summary&gt;]) { // trait object overhead for no reason
    for item in items { println!("{}", item.summarize()); }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BETTER: use a generic slice when all items are the same type
fn print_all&lt;T: Summary&gt;(items: &amp;[T]) {
    for item in items { println!("{}", item.summarize()); }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 46: Static vs Dynamic Dispatch
     --------------------------------------------------------------- */
  'ch46': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 46,
    title: 'Static vs Dynamic Dispatch',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 46</span>
</div>

<h1>Static vs Dynamic Dispatch</h1>

<p>When you call a method through a trait, Rust has to figure out which specific function to actually run. There are two ways it can do this: at compile time (static dispatch) or at runtime (dynamic dispatch). Understanding the difference explains why generics with trait bounds and trait objects exist as separate features, and helps you choose between them.</p>

<h2>The Pre-Planned Meeting vs Walk-In Analogy</h2>

<p>Imagine a hotel. For guests with a confirmed reservation, staff know before the guest arrives exactly which room they will be in, which floor service they will need, and which amenities to prepare. Everything is set up in advance: no decisions needed at check-in. That is static dispatch: the compiler decides everything at compile time.</p>

<p>Now imagine a walk-in guest. Staff cannot prepare in advance. At check-in, they look up available rooms, assign one, and figure out what the guest needs. There is a brief moment of lookup and decision-making at runtime. That is dynamic dispatch: the program decides at runtime by looking up the correct method.</p>

<h2>Static Dispatch: The Compiler Decides</h2>

<p>When you use a generic type parameter with a trait bound (<code>T: Draw</code>), the compiler generates a separate, concrete version of your function for every type <code>T</code> that is actually used. This is monomorphization, which you saw in the Generics chapter. The result is that each call site uses a direct function call with no indirection:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Describe {
    fn describe(&amp;self) -&gt; String;
}

struct Cat;
struct Dog;

impl Describe for Cat {
    fn describe(&amp;self) -&gt; String { String::from("A cat") }
}
impl Describe for Dog {
    fn describe(&amp;self) -&gt; String { String::from("A dog") }
}

// Generic function: the compiler generates one copy for Cat, one for Dog.
fn print_description&lt;T: Describe&gt;(item: &amp;T) {
    println!("{}", item.describe());
}

fn main() {
    let cat = Cat;
    let dog = Dog;

    print_description(&amp;cat); // compiled as: Cat::describe(&amp;cat)
    print_description(&amp;dog); // compiled as: Dog::describe(&amp;dog)
}</code></pre>
</div>

<pre class="output"><code>A cat
A dog</code></pre>

<p>After monomorphization, each call to <code>print_description</code> is a direct, inlined call to the right function. The CPU does not need to look anything up: the binary already knows exactly which code to run. This is the maximum possible performance.</p>

<h2>Dynamic Dispatch: The Runtime Decides</h2>

<p>When you use a trait object (<code>&amp;dyn Trait</code> or <code>Box&lt;dyn Trait&gt;</code>), the compiler does not know the concrete type at compile time. Instead, it stores two pointers together: one to the data, and one to a <strong>vtable</strong> (virtual dispatch table). The vtable is a small lookup table that maps each trait method to the address of the correct implementation for that specific type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Describe {
    fn describe(&amp;self) -&gt; String;
}

struct Cat;
struct Dog;

impl Describe for Cat { fn describe(&amp;self) -&gt; String { String::from("A cat") } }
impl Describe for Dog { fn describe(&amp;self) -&gt; String { String::from("A dog") } }

// Trait object: one function handles all types, decides at runtime.
fn print_description_dyn(item: &amp;dyn Describe) {
    println!("{}", item.describe()); // looks up describe() in the vtable at runtime
}

fn main() {
    let cat = Cat;
    let dog = Dog;

    print_description_dyn(&amp;cat);
    print_description_dyn(&amp;dog);

    // The real power: a Vec holding different types
    let animals: Vec&lt;Box&lt;dyn Describe&gt;&gt; = vec![Box::new(Cat), Box::new(Dog)];
    for animal in &amp;animals {
        println!("{}", animal.describe()); // runtime vtable lookup each time
    }
}</code></pre>
</div>

<pre class="output"><code>A cat
A dog
A cat
A dog</code></pre>

<h2>Under the Hood: What a Trait Object Looks Like</h2>

<p>A trait object (<code>&amp;dyn Describe</code>) is a <em>fat pointer</em>: two words of memory instead of one. The first word points to the data. The second word points to the vtable. At runtime, calling a method involves reading the vtable pointer, looking up the right function address, and jumping to it. This indirection costs a few CPU cycles per call and prevents the compiler from inlining the method:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Conceptual model (not actual Rust syntax):
// &amp;dyn Describe is roughly:
// {
//     data_ptr: *const (),          // pointer to the actual Cat or Dog value
//     vtable_ptr: *const VTable,    // pointer to the method table for that type
// }
//
// VTable for Cat:
// {
//     describe: Cat::describe as fn(*const ()) -&gt; String,
//     drop:     ...
// }
//
// Calling item.describe() means:
//   1. Read item.vtable_ptr
//   2. Read vtable_ptr.describe
//   3. Call that function with item.data_ptr</code></pre>
</div>

<h2>Comparing the Two Approaches</h2>

<dl>
  <dt>Static dispatch (generics)</dt>
  <dd>Faster: direct call, no pointer indirection. Enables inlining. Longer compile times and larger binary (one copy per type used). Requires all types to be known at compile time.</dd>
  <dt>Dynamic dispatch (trait objects)</dt>
  <dd>Slightly slower: one extra pointer dereference per call. Cannot inline. Shorter compile times, smaller binary (one copy shared by all types). Works when types are unknown at compile time or when you need heterogeneous collections.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Compute {
    fn run(&amp;self) -&gt; u64;
}

struct Fast  { data: u64 }
struct Slow  { data: u64 }

impl Compute for Fast { fn run(&amp;self) -&gt; u64 { self.data * 2 } }
impl Compute for Slow { fn run(&amp;self) -&gt; u64 { self.data + 1 } }

// Static: compiler generates specialized code for Fast and Slow separately.
fn benchmark_static&lt;T: Compute&gt;(item: &amp;T) -&gt; u64 {
    item.run()
}

// Dynamic: one function, vtable lookup at runtime.
fn benchmark_dynamic(item: &amp;dyn Compute) -&gt; u64 {
    item.run()
}

fn main() {
    let f = Fast { data: 100 };
    let s = Slow { data: 100 };

    println!("static fast:   {}", benchmark_static(&amp;f));   // 200
    println!("static slow:   {}", benchmark_static(&amp;s));   // 101
    println!("dynamic fast:  {}", benchmark_dynamic(&amp;f));  // 200
    println!("dynamic slow:  {}", benchmark_dynamic(&amp;s));  // 101
}</code></pre>
</div>

<pre class="output"><code>static fast:   200
static slow:   101
dynamic fast:  200
dynamic slow:  101</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>In most programs, the performance difference between static and dynamic dispatch is negligible. Profile before optimizing. Choose trait objects when they make the code cleaner and more flexible, and reach for generics when performance in a hot loop is critical.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Assuming Dynamic Dispatch Is Always Slower and Avoiding It Unnecessarily</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// OVERCOMPLICATED: enum just to avoid dyn Trait in a non-critical path
enum Animal {
    Dog(Dog),
    Cat(Cat),
    Bird(Bird),
    // ... must update this enum every time a new animal type is added
}

fn make_sound(a: &amp;Animal) {
    match a {
        Animal::Dog(d) =&gt; d.speak(),
        Animal::Cat(c) =&gt; c.speak(),
        Animal::Bird(b) =&gt; b.speak(),
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// SIMPLER: trait objects work well for this use case
pub trait Animal { fn speak(&amp;self); }

fn make_sound(a: &amp;dyn Animal) { a.speak(); }
// New animal types can be added without touching make_sound</code></pre>
</div>

<h3>Mistake 2: Using Dynamic Dispatch in an Inner Loop Where Performance Matters</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Transform { fn apply(&amp;self, x: f64) -&gt; f64; }

// In a hot loop: each call hits the vtable — avoids inlining
fn process_slow(data: &amp;[f64], transform: &amp;dyn Transform) -&gt; Vec&lt;f64&gt; {
    data.iter().map(|&amp;x| transform.apply(x)).collect() // vtable lookup per element
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// In a hot loop: generic enables inlining and SIMD optimizations
fn process_fast&lt;T: Transform&gt;(data: &amp;[f64], transform: &amp;T) -&gt; Vec&lt;f64&gt; {
    data.iter().map(|&amp;x| transform.apply(x)).collect() // direct call, inlineable
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 47: Operator Overloading
     --------------------------------------------------------------- */
  'ch47': {
    moduleNum: 7,
    moduleTitle: 'Traits, Generics &amp; Type System',
    chNum: 47,
    title: 'Operator Overloading',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 7 &mdash; Chapter 47</span>
</div>

<h1>Operator Overloading: Custom Behavior for Built-in Operators</h1>

<p>Rust lets you define what built-in operators like <code>+</code>, <code>-</code>, <code>*</code>, and <code>==</code> mean for your own types. This is done by implementing traits from the <code>std::ops</code> module. The result is that your types can be used with natural mathematical and comparison syntax, making them feel like first-class language primitives.</p>

<h2>The Custom Dictionary Analogy</h2>

<p>In most languages, operators like <code>+</code> have a fixed, built-in meaning for built-in types. Rust goes further: you can write your own "dictionary entry" for what <code>+</code> means when applied to your type, by implementing the <code>Add</code> trait. Every operator in Rust is backed by a trait, and any type can implement any of those traits. Operators are nothing more than readable shorthand for method calls.</p>

<h2>The Add Trait</h2>

<p>The <code>+</code> operator is defined by <code>std::ops::Add</code>. Its definition in the standard library looks like this:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// From the standard library:
pub trait Add&lt;Rhs = Self&gt; {
    type Output; // the type produced by addition

    fn add(self, rhs: Rhs) -&gt; Self::Output;
}</code></pre>
</div>

<p><code>Rhs</code> is the type of the right-hand side. It defaults to <code>Self</code> (the same type as the left side), but you can change it. <code>Output</code> is an associated type: the type the addition produces.</p>

<h2>Implementing Add for a Custom Type</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Add;

#[derive(Debug, Copy, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point; // Point + Point = Point

    fn add(self, other: Point) -&gt; Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = Point { x: 3, y: 4 };
    let p3 = p1 + p2; // calls Point::add(p1, p2)
    println!("{:?}", p3); // Point { x: 4, y: 6 }

    assert_eq!(p3, Point { x: 4, y: 6 });
}</code></pre>
</div>

<pre class="output"><code>Point { x: 4, y: 6 }</code></pre>

<h2>Adding Different Types Together</h2>

<p>By specifying a different <code>Rhs</code> type, you can define addition between two different types:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Add;

#[derive(Debug, Copy, Clone)]
struct Millimeters(u32);

#[derive(Debug, Copy, Clone)]
struct Meters(u32);

// Millimeters + Meters = Millimeters
impl Add&lt;Meters&gt; for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -&gt; Millimeters {
        Millimeters(self.0 + other.0 * 1000)
    }
}

fn main() {
    let short = Millimeters(500);
    let tall  = Meters(2);
    let total = short + tall; // Millimeters + Meters
    println!("{:?}", total);  // Millimeters(2500)
}</code></pre>
</div>

<pre class="output"><code>Millimeters(2500)</code></pre>

<h2>Other Arithmetic Operators</h2>

<p>The same pattern applies to other arithmetic operators. Each has its own trait in <code>std::ops</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::{Add, Sub, Mul, Neg};

#[derive(Debug, Copy, Clone, PartialEq)]
struct Vec2 {
    x: f64,
    y: f64,
}

impl Add for Vec2 {
    type Output = Vec2;
    fn add(self, other: Vec2) -&gt; Vec2 {
        Vec2 { x: self.x + other.x, y: self.y + other.y }
    }
}

impl Sub for Vec2 {
    type Output = Vec2;
    fn sub(self, other: Vec2) -&gt; Vec2 {
        Vec2 { x: self.x - other.x, y: self.y - other.y }
    }
}

impl Mul&lt;f64&gt; for Vec2 {
    type Output = Vec2;
    fn mul(self, scalar: f64) -&gt; Vec2 {
        Vec2 { x: self.x * scalar, y: self.y * scalar }
    }
}

impl Neg for Vec2 {
    type Output = Vec2;
    fn neg(self) -&gt; Vec2 {
        Vec2 { x: -self.x, y: -self.y }
    }
}

impl Vec2 {
    fn length(&amp;self) -&gt; f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
}

fn main() {
    let a = Vec2 { x: 3.0, y: 4.0 };
    let b = Vec2 { x: 1.0, y: 2.0 };

    println!("a + b = {:?}", a + b);     // Vec2 { x: 4.0, y: 6.0 }
    println!("a - b = {:?}", a - b);     // Vec2 { x: 2.0, y: 2.0 }
    println!("a * 2 = {:?}", a * 2.0);  // Vec2 { x: 6.0, y: 8.0 }
    println!("-a    = {:?}", -a);        // Vec2 { x: -3.0, y: -4.0 }
    println!("|a|   = {}", a.length()); // 5
}</code></pre>
</div>

<pre class="output"><code>a + b = Vec2 { x: 4.0, y: 6.0 }
a - b = Vec2 { x: 2.0, y: 2.0 }
a * 2 = Vec2 { x: 6.0, y: 8.0 }
-a    = Vec2 { x: -3.0, y: -4.0 }
|a|   = 5</code></pre>

<h2>The Display Trait for Printing</h2>

<p>The <code>{}</code> format specifier calls the <code>std::fmt::Display</code> trait. Implementing it gives your type a human-readable string representation:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

#[derive(Debug)]
struct Point { x: i32, y: i32 }

impl fmt::Display for Point {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter&lt;'_&gt;) -&gt; fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 3, y: -7 };
    println!("{}", p);   // (3, -7)       — uses Display
    println!("{:?}", p); // Point { x: 3, y: -7 } — uses Debug
}</code></pre>
</div>

<pre class="output"><code>(3, -7)
Point { x: 3, y: -7 }</code></pre>

<h2>PartialEq and Eq for Equality Operators</h2>

<p>The <code>==</code> and <code>!=</code> operators are backed by <code>std::cmp::PartialEq</code>. For most types, <code>#[derive(PartialEq)]</code> is all you need. Implement it manually when you want custom equality logic:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Color {
    r: u8,
    g: u8,
    b: u8,
}

impl PartialEq for Color {
    fn eq(&amp;self, other: &amp;Self) -&gt; bool {
        self.r == other.r &amp;&amp; self.g == other.g &amp;&amp; self.b == other.b
    }
}

fn main() {
    let red1 = Color { r: 255, g: 0, b: 0 };
    let red2 = Color { r: 255, g: 0, b: 0 };
    let blue = Color { r: 0, g: 0, b: 255 };

    println!("{}", red1 == red2); // true
    println!("{}", red1 == blue); // false
    println!("{}", red1 != blue); // true
}</code></pre>
</div>

<pre class="output"><code>true
false
true</code></pre>

<h2>The Index Operator</h2>

<p>The <code>[]</code> operator for immutable access is defined by <code>std::ops::Index</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Index;

struct Matrix {
    data: [[f64; 3]; 3],
}

// Index by (row, col) tuple
impl Index&lt;(usize, usize)&gt; for Matrix {
    type Output = f64;

    fn index(&amp;self, (row, col): (usize, usize)) -&gt; &amp;f64 {
        &amp;self.data[row][col]
    }
}

fn main() {
    let m = Matrix {
        data: [[1.0, 2.0, 3.0],
               [4.0, 5.0, 6.0],
               [7.0, 8.0, 9.0]],
    };

    println!("m[1,2] = {}", m[(1, 2)]); // 6 (row 1, col 2)
    println!("m[0,0] = {}", m[(0, 0)]); // 1
}</code></pre>
</div>

<pre class="output"><code>m[1,2] = 6
m[0,0] = 1</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting That Arithmetic Operators Consume (Move) Their Operands</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Add;

#[derive(Debug)]
struct Point { x: i32, y: i32 }

impl Add for Point {
    type Output = Point;
    fn add(self, other: Point) -&gt; Point {
        Point { x: self.x + other.x, y: self.y + other.y }
    }
}

fn main() {
    let a = Point { x: 1, y: 2 };
    let b = Point { x: 3, y: 4 };
    let c = a + b; // a and b are MOVED here
    // println!("{:?}", a); // error: a was moved
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED option 1: derive Copy so the values are copied instead of moved
#[derive(Debug, Copy, Clone)]
struct Point { x: i32, y: i32 }

// FIXED option 2: implement Add for references
impl Add for &amp;Point {
    type Output = Point;
    fn add(self, other: &amp;Point) -&gt; Point {
        Point { x: self.x + other.x, y: self.y + other.y }
    }
}

fn main() {
    let a = Point { x: 1, y: 2 };
    let b = Point { x: 3, y: 4 };
    let c = &amp;a + &amp;b; // borrows a and b — both still usable
    println!("{:?}", a); // fine
    println!("{:?}", c);
}</code></pre>
</div>

<h3>Mistake 2: Implementing Display Instead of Debug for Diagnostic Output</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

struct Config { timeout: u32 }

impl fmt::Display for Config {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "timeout={}", self.timeout)
    }
}

fn main() {
    let c = Config { timeout: 30 };
    println!("{}", c);    // fine: Display works
    // println!("{:?}", c); // error: Debug not implemented
    // Fix: also add #[derive(Debug)]
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BEST PRACTICE: always derive Debug, implement Display when user-facing output is needed
use std::fmt;

#[derive(Debug)] // for {:?}
struct Config { timeout: u32 }

impl fmt::Display for Config { // for {}
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "timeout={}s", self.timeout)
    }
}</code></pre>
</div>

<h3>Mistake 3: Overloading Operators in Ways That Violate Expected Semantics</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Add;

struct User { name: String, age: u32 }

// WRONG: User + User producing a bool is completely unexpected and confusing
impl Add for User {
    type Output = bool;
    fn add(self, other: User) -&gt; bool {
        self.age &gt; other.age // addition that returns a boolean? Makes no sense.
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CORRECT: only overload operators when the result matches natural expectations
// User + User producing a combined User might make sense in a "merge accounts" context.
// Or just write a named method: fn is_older_than(&amp;self, other: &amp;User) -&gt; bool</code></pre>
</div>
`
  },

});
