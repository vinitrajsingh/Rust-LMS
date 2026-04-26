/* ================================================================
   Module 6: Collections & Error Handling
   Chapters: 33 - 40  (all complete)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 33: Vec<T>
     --------------------------------------------------------------- */
  'ch33': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 33,
    title: 'Vec&lt;T&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 33</span>
</div>

<h1>Vec&lt;T&gt;: Growable Lists</h1>

<p>The most common collection in Rust is the <strong>vector</strong>, written <code>Vec&lt;T&gt;</code>. A vector stores multiple values of the same type, one after the other, in a single block of memory. Unlike arrays (which have a fixed size), vectors can grow or shrink at runtime. They are the Rust equivalent of an ArrayList in Java or a list in Python.</p>

<h2>The Shopping List Analogy</h2>

<p>Think of a <code>Vec</code> like a paper shopping list. You can add items at the bottom, cross items off, read the third item without reading the first two, and the list automatically gets longer paper when you run out of space. Every item on the list must be the same kind of thing: a grocery item. You cannot mix grocery items and plumbing fixtures on the same list without wrapping them in some common category. That "common category" is the role an enum plays when you need to store different types in one vector.</p>

<h2>Creating a Vector</h2>

<p>There are two common ways to create a vector. Use <code>Vec::new()</code> when you want to start empty. Use the <code>vec!</code> macro when you have initial values:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Empty vector: type annotation required because Rust cannot infer T yet.
    let mut numbers: Vec&lt;i32&gt; = Vec::new();

    // vec! macro: type inferred from the initial values.
    let scores = vec![10, 20, 30];

    // With an initial capacity to avoid repeated reallocation.
    let mut big_list: Vec&lt;String&gt; = Vec::with_capacity(100);

    println!("scores: {:?}", scores);
    println!("numbers length: {}", numbers.len());
    println!("big_list capacity: {}", big_list.capacity());
}</code></pre>
</div>

<pre class="output"><code>scores: [10, 20, 30]
numbers length: 0
big_list capacity: 100</code></pre>

<h2>Adding and Removing Elements</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut v: Vec&lt;i32&gt; = Vec::new();

    v.push(5);
    v.push(6);
    v.push(7);
    v.push(8);

    println!("after push: {:?}", v); // [5, 6, 7, 8]

    let last = v.pop(); // removes and returns the last element
    println!("popped: {:?}", last);  // Some(8)
    println!("after pop: {:?}", v);  // [5, 6, 7]
}</code></pre>
</div>

<pre class="output"><code>after push: [5, 6, 7, 8]
popped: Some(8)
after pop: [5, 6, 7]</code></pre>

<p><code>pop()</code> returns <code>Option&lt;&amp;T&gt;</code> because the vector might be empty, in which case it returns <code>None</code>. You never panic by calling <code>pop()</code> on an empty vector.</p>

<h2>Reading Elements: Indexing vs get()</h2>

<p>There are two ways to read an element from a vector. They behave very differently when the index is out of bounds:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![10, 20, 30, 40, 50];

    // Method 1: Index syntax — panics if out of bounds.
    let third: &amp;i32 = &amp;v[2];
    println!("The third element is {}", third); // 30

    // Method 2: get() — returns Option, never panics.
    match v.get(2) {
        Some(val) => println!("get(2) = {}", val), // 30
        None      => println!("No element at index 2"),
    }

    // What happens with an invalid index?
    let invalid = v.get(100);
    println!("get(100) = {:?}", invalid); // None — safe

    // &v[100] would panic here — program terminates
}</code></pre>
</div>

<pre class="output"><code>The third element is 30
get(2) = 30
get(100) = None</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Use <code>&amp;v[i]</code> when you are certain the index is valid (for example, after checking <code>v.len()</code>). Use <code>v.get(i)</code> whenever the index comes from user input or an external source. The <code>Option</code> return forces you to handle the "not found" case explicitly.</p>
</div>

<h2>Borrowing Rules with Vectors</h2>

<p>Vectors follow the same borrowing rules as every other Rust value. You cannot hold an immutable reference to an element and also mutate the vector at the same time. The reason is subtle but important: when a vector needs more space, it allocates a new block of memory and copies everything there. Any references you held to the old memory would now point to freed memory:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut v = vec![1, 2, 3, 4, 5];

    let first = &amp;v[0]; // immutable borrow of first element

    // v.push(6); // error! cannot mutate v while first is alive
    // The push might reallocate — first would dangle.

    println!("first element: {}", first); // borrow ends here
    v.push(6); // fine now — first is no longer in use
    println!("after push: {:?}", v);
}</code></pre>
</div>

<pre class="output"><code>first element: 1
after push: [1, 2, 3, 4, 5, 6]</code></pre>

<h2>Iterating Over a Vector</h2>

<p>Use a <code>for</code> loop with <code>&amp;v</code> to iterate without consuming the vector. Use <code>&amp;mut v</code> to modify elements in place:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![100, 32, 57];

    // Immutable iteration: borrow each element
    for n in &amp;v {
        println!("{}", n);
    }

    let mut prices = vec![10, 20, 30];

    // Mutable iteration: dereference with * to modify
    for price in &amp;mut prices {
        *price *= 2; // double each price
    }
    println!("doubled: {:?}", prices); // [20, 40, 60]
}</code></pre>
</div>

<pre class="output"><code>100
32
57
doubled: [20, 40, 60]</code></pre>

<h2>Storing Multiple Types with an Enum</h2>

<p>A vector can only hold one type. When you need to store values of different types, define an enum whose variants hold the different types. The vector stores values of the enum type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
enum Cell {
    Int(i64),
    Float(f64),
    Text(String),
}

fn main() {
    let row = vec![
        Cell::Int(42),
        Cell::Float(3.14),
        Cell::Text(String::from("Rust")),
    ];

    for cell in &amp;row {
        match cell {
            Cell::Int(i)   => println!("integer: {}", i),
            Cell::Float(f) => println!("float:   {}", f),
            Cell::Text(s)  => println!("text:    {}", s),
        }
    }
}</code></pre>
</div>

<pre class="output"><code>integer: 42
float:   3.14
text:    Rust</code></pre>

<h2>Length, Capacity, and Dropping</h2>

<p>A vector tracks two numbers: its <em>length</em> (how many elements it currently holds) and its <em>capacity</em> (how many elements it can hold before needing to reallocate). When a vector goes out of scope, all its elements are dropped automatically:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1, 2, 3, 4, 5];
    println!("len: {}, capacity: {}", v.len(), v.capacity()); // 5, 5

    let mut growing = Vec::new();
    for i in 0..10 {
        growing.push(i);
        println!("len={}, cap={}", growing.len(), growing.capacity());
    }
    // When growing goes out of scope here, all elements are freed.
}</code></pre>
</div>

<p>Capacity typically doubles each time reallocation is needed: 1, 2, 4, 8, 16... If you know how many elements you will need, use <code>Vec::with_capacity(n)</code> to preallocate and avoid reallocations entirely.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Indexing Instead of get() When the Index Might Be Invalid</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: panics if user_input is out of range
fn get_score(scores: &amp;Vec&lt;i32&gt;, user_input: usize) -&gt; i32 {
    scores[user_input] // panics if user_input &gt;= scores.len()
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return None gracefully when index is out of range
fn get_score(scores: &amp;[i32], user_input: usize) -&gt; Option&lt;i32&gt; {
    scores.get(user_input).copied()
}</code></pre>
</div>

<h3>Mistake 2: Trying to Mutate a Vec While Holding a Reference to an Element</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: first borrows v, then push tries to mutate v
fn main() {
    let mut v = vec![1, 2, 3];
    let first = &amp;v[0];
    v.push(4);              // error: cannot borrow as mutable
    println!("{}", first);
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use the reference before mutating
fn main() {
    let mut v = vec![1, 2, 3];
    println!("{}", v[0]); // use first element immediately
    v.push(4);            // now safe to mutate
    println!("{:?}", v);
}</code></pre>
</div>

<h3>Mistake 3: Using for i in v Instead of for i in &amp;v (Consumes the Vector)</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: v is moved into the for loop and cannot be used afterward
fn main() {
    let v = vec![1, 2, 3];
    for n in v { println!("{}", n); } // v is consumed here
    println!("{:?}", v); // error: use of moved value
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: iterate by reference
fn main() {
    let v = vec![1, 2, 3];
    for n in &amp;v { println!("{}", n); } // v is borrowed, not moved
    println!("{:?}", v); // v still available
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 34: String
     --------------------------------------------------------------- */
  'ch34': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 34,
    title: 'String',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 34</span>
</div>

<h1>String: Owned, Growable Text</h1>

<p>Rust has two string types that work together. The first is <code>&amp;str</code>, a string slice: an immutable view into some string data stored elsewhere. You saw this type in the lifetime chapters. The second is <code>String</code>: an owned, heap-allocated, growable string. Most programs that manipulate text use <code>String</code> for storage and <code>&amp;str</code> for reading.</p>

<h2>The Whiteboard vs Printed Page Analogy</h2>

<p>Think of <code>&amp;str</code> as a printed page: the text is fixed, you can read it but not change it. Think of <code>String</code> as a whiteboard: you own it, you can erase and rewrite, add more text, or hand it to someone else. When you want to show someone your whiteboard, you can hold it up for them to read (that is borrowing it as <code>&amp;str</code>) without transferring ownership of the board itself.</p>

<h2>Creating a String</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Three equivalent ways to create a String from a literal
    let s1 = String::from("hello");
    let s2 = "hello".to_string();
    let s3 = "hello".to_owned();

    // An empty String
    let mut s4 = String::new();
    s4.push_str("filled later");

    println!("{} {} {} {}", s1, s2, s3, s4);

    // String holds any valid UTF-8
    let arabic  = String::from("مرحبا");
    let japanese = String::from("こんにちは");
    println!("{}", arabic);
    println!("{}", japanese);
}</code></pre>
</div>

<pre class="output"><code>hello hello hello filled later
مرحبا
こんにちは</code></pre>

<h2>Updating a String</h2>

<p>Use <code>push_str</code> to append a string slice, and <code>push</code> to append a single character. Both require the String to be <code>mut</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let mut greeting = String::from("Hello");
    greeting.push_str(", world"); // append a &amp;str — does NOT take ownership
    greeting.push('!');           // append a single char

    println!("{}", greeting);     // Hello, world!

    // push_str does not take ownership of its argument
    let suffix = " How are you?";
    greeting.push_str(suffix);
    println!("{}", suffix);       // suffix still usable
    println!("{}", greeting);     // Hello, world! How are you?
}</code></pre>
</div>

<pre class="output"><code>Hello, world!
 How are you?
Hello, world! How are you?</code></pre>

<h2>Concatenation with + and format!</h2>

<p>The <code>+</code> operator concatenates two strings, but it moves the left operand. This feels surprising at first:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");
    let s3 = s1 + &amp;s2; // s1 is MOVED here — you cannot use s1 again
    println!("{}", s3); // Hello, world!
    // println!("{}", s1); // error: s1 was moved
    println!("{}", s2); // s2 was only borrowed, still valid
}</code></pre>
</div>

<pre class="output"><code>Hello, world!
world!</code></pre>

<p>The <code>+</code> operator uses an <code>add</code> method that takes <code>self</code> (consuming it) and <code>&amp;str</code> as the second argument. Rust automatically converts <code>&amp;String</code> to <code>&amp;str</code> via deref coercion.</p>

<p>For combining more than two strings, <code>format!</code> is cleaner and does not move any of its arguments:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let first  = String::from("tic");
    let second = String::from("tac");
    let third  = String::from("toe");

    // format! borrows all arguments — nothing is moved
    let result = format!("{}-{}-{}", first, second, third);
    println!("{}", result);  // tic-tac-toe
    println!("{}", first);   // still valid
}</code></pre>
</div>

<pre class="output"><code>tic-tac-toe
tic</code></pre>

<h2>Why You Cannot Index a String</h2>

<p>Coming from Python or JavaScript you might expect <code>s[0]</code> to give you the first character. Rust rejects this:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile.
fn main() {
    let s = String::from("hello");
    let c = s[0]; // error: String cannot be indexed by integer
}</code></pre>
</div>

<p>The reason is that <code>String</code> stores bytes in UTF-8 encoding. Not every character is one byte. The Cyrillic letter "З" takes two bytes. The Hindi character "न" takes three bytes. Index 0 into "Здравствуйте" gives you the first <em>byte</em> (208), not the first character ("З"). Rust refuses to guess which interpretation you want.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let hello = "Здравствуйте";

    // Byte length: 24 (each Cyrillic letter = 2 bytes)
    println!("byte length: {}", hello.len());

    // Character count: 12
    println!("char count: {}", hello.chars().count());
}</code></pre>
</div>

<pre class="output"><code>byte length: 24
char count: 12</code></pre>

<h2>Slicing Strings</h2>

<p>You can slice a string by byte range using <code>&amp;s[start..end]</code>, but you must land on valid UTF-8 character boundaries. Slicing in the middle of a multi-byte character causes a panic:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s = String::from("Здравствуйте");

    // Each Cyrillic letter = 2 bytes.
    // Bytes 0..4 = first 2 characters "Зд"
    let slice = &amp;s[0..4];
    println!("{}", slice); // Зд

    // &amp;s[0..1] would PANIC: byte index 1 is not a char boundary
}</code></pre>
</div>

<pre class="output"><code>Зд</code></pre>

<h2>Iterating Over a String</h2>

<p>Use <code>chars()</code> to iterate over Unicode characters (the right choice for most text processing), or <code>bytes()</code> for the raw byte values:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let word = "Зд";

    print!("chars: ");
    for c in word.chars() {
        print!("'{}' ", c); // З д
    }
    println!();

    print!("bytes: ");
    for b in word.bytes() {
        print!("{} ", b); // 208 151 208 180
    }
    println!();

    // Counting characters safely
    let emoji = "Hello 🦀";
    println!("char count: {}", emoji.chars().count()); // 7
    println!("byte count: {}", emoji.len());            // 10
}</code></pre>
</div>

<pre class="output"><code>chars: 'З' 'д'
bytes: 208 151 208 180
char count: 7
byte count: 10</code></pre>

<h2>Useful String Methods</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let s = String::from("  Hello, Rust!  ");

    println!("{}", s.trim());                    // "Hello, Rust!"
    println!("{}", s.trim().to_uppercase());     // "HELLO, RUST!"
    println!("{}", s.trim().to_lowercase());     // "hello, rust!"
    println!("{}", s.contains("Rust"));          // true
    println!("{}", s.trim().replace("Rust", "World")); // "Hello, World!"

    // Splitting
    let csv = "one,two,three";
    let parts: Vec&lt;&amp;str&gt; = csv.split(',').collect();
    println!("{:?}", parts); // ["one", "two", "three"]

    // Starts/ends with
    println!("{}", csv.starts_with("one")); // true
    println!("{}", csv.ends_with("three")); // true
}</code></pre>
</div>

<pre class="output"><code>Hello, Rust!
HELLO, RUST!
hello, rust!
true
Hello, World!
["one", "two", "three"]
true
true</code></pre>

<h2>Converting Between &amp;str and String</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // &amp;str to String
    let owned: String = "hello".to_string();
    let owned2: String = String::from("hello");

    // String to &amp;str (borrow it)
    let slice: &amp;str = &amp;owned;
    let slice2: &amp;str = owned.as_str();

    // Functions that accept &amp;str work with both
    fn print_str(s: &amp;str) { println!("{}", s); }

    print_str("literal");   // &amp;str directly
    print_str(&amp;owned);      // &amp;String coerces to &amp;str automatically
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Trying to Index a String by Integer</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: String cannot be indexed by integer
fn first_char(s: &amp;str) -&gt; char {
    s[0] // error: String cannot be indexed by {integer}
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use chars().nth() to get a character by position
fn first_char(s: &amp;str) -&gt; Option&lt;char&gt; {
    s.chars().next()
}

fn nth_char(s: &amp;str, n: usize) -&gt; Option&lt;char&gt; {
    s.chars().nth(n)
}</code></pre>
</div>

<h3>Mistake 2: Forgetting That + Moves the Left Operand</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: s1 is moved by +, then used again
fn main() {
    let s1 = String::from("Hello");
    let s2 = String::from(" world");
    let s3 = s1 + &amp;s2;
    println!("{}", s1); // error: s1 has been moved
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use format! which borrows all arguments
fn main() {
    let s1 = String::from("Hello");
    let s2 = String::from(" world");
    let s3 = format!("{}{}", s1, s2);
    println!("{}", s1); // still valid
    println!("{}", s3);
}</code></pre>
</div>

<h3>Mistake 3: Slicing on a Non-Character Boundary</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN at runtime: byte 1 is inside a 2-byte Cyrillic character
fn main() {
    let s = "Здравствуйте";
    let bad_slice = &amp;s[0..1]; // PANICS at runtime
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: use chars and collect, or use byte-aligned boundaries
fn first_n_chars(s: &amp;str, n: usize) -&gt; String {
    s.chars().take(n).collect()
}

fn main() {
    println!("{}", first_n_chars("Здравствуйте", 2)); // "Зд"
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 35: HashMap<K, V>
     --------------------------------------------------------------- */
  'ch35': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 35,
    title: 'HashMap&lt;K, V&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 35</span>
</div>

<h1>HashMap&lt;K, V&gt;: Key-Value Storage</h1>

<p>A <code>HashMap&lt;K, V&gt;</code> stores pairs of keys and values. Given a key, it can look up the corresponding value in near-constant time, regardless of how many entries the map has. This makes it the ideal data structure when you need to associate one piece of data with another: a username with a score, a word with its frequency, a city with its population.</p>

<h2>The Phone Book Analogy</h2>

<p>A phone book maps names (keys) to phone numbers (values). When you want to call someone, you look up their name and find the number instantly, without reading every page. Adding a new entry, updating a number, or removing a person all work the same way. You cannot have two entries for the same name (keys are unique), and all names must be the same kind of thing (all keys must be the same type).</p>

<h2>Creating and Populating a HashMap</h2>

<p><code>HashMap</code> is not in the prelude: you must bring it into scope with <code>use</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let mut scores: HashMap&lt;String, i32&gt; = HashMap::new();

    scores.insert(String::from("Alice"), 10);
    scores.insert(String::from("Bob"),   50);
    scores.insert(String::from("Carol"), 30);

    println!("{:?}", scores);
}</code></pre>
</div>

<pre class="output"><code>{"Alice": 10, "Carol": 30, "Bob": 50}</code></pre>

<p>The output order is arbitrary: <code>HashMap</code> does not preserve insertion order.</p>

<h2>Accessing Values</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Alice"), 10);
    scores.insert(String::from("Bob"),   50);

    // get() returns Option&lt;&amp;V&gt; — safe, never panics
    let name = String::from("Alice");
    let score = scores.get(&amp;name).copied().unwrap_or(0);
    println!("Alice's score: {}", score); // 10

    // Missing key returns None
    let missing = scores.get("Dave").copied().unwrap_or(0);
    println!("Dave's score:  {}", missing); // 0 (default)

    // Index syntax panics if the key is missing
    // let bad = scores["Unknown"]; // PANICS
}</code></pre>
</div>

<pre class="output"><code>Alice's score: 10
Dave's score:  0</code></pre>

<p><code>.copied()</code> converts <code>Option&lt;&amp;i32&gt;</code> to <code>Option&lt;i32&gt;</code> by copying the integer value (valid because <code>i32</code> is <code>Copy</code>). <code>.unwrap_or(0)</code> then provides a default if the key was not found.</p>

<h2>Iterating Over a HashMap</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("Alice", 10);
    scores.insert("Bob",   50);
    scores.insert("Carol", 30);

    // Iterate over key-value pairs in arbitrary order
    for (name, score) in &amp;scores {
        println!("{}: {}", name, score);
    }
}</code></pre>
</div>

<pre class="output"><code>Alice: 10
Carol: 30
Bob: 50</code></pre>

<h2>Ownership and Hash Maps</h2>

<p>For types that implement <code>Copy</code> (like <code>i32</code>), the values are copied into the map. For owned types like <code>String</code>, the values are moved and the original variables become invalid:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let key   = String::from("color");
    let value = String::from("blue");

    let mut map = HashMap::new();
    map.insert(key, value); // both key and value are MOVED into the map

    // println!("{}", key);   // error: key has been moved
    // println!("{}", value); // error: value has been moved

    // To keep the original, insert references (but then you need lifetimes)
    // Or clone the values before inserting:
    let word = String::from("hello");
    map.insert(word.clone(), 0); // word is still usable
    println!("{}", word); // fine
}</code></pre>
</div>

<h2>Updating a HashMap</h2>

<p>There are three common update patterns: overwrite, insert only if absent, and modify based on the current value.</p>

<h3>Pattern 1: Overwrite</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("Blue", 10);
    scores.insert("Blue", 25); // overwrites 10
    println!("{:?}", scores);  // {"Blue": 25}
}</code></pre>
</div>

<h3>Pattern 2: Insert Only If the Key Does Not Exist (Entry API)</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Blue"), 10);

    // Insert 50 for "Yellow" (new key), keep 10 for "Blue" (existing key)
    scores.entry(String::from("Yellow")).or_insert(50);
    scores.entry(String::from("Blue")).or_insert(50); // no effect

    println!("{:?}", scores); // {"Blue": 10, "Yellow": 50}
}</code></pre>
</div>

<pre class="output"><code>{"Blue": 10, "Yellow": 50}</code></pre>

<h3>Pattern 3: Update Based on the Current Value</h3>

<p>The classic word-count example: for each word in a string, either start counting at 1 or increment the existing count:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let text = "hello world wonderful world hello hello";
    let mut word_count: HashMap&lt;&amp;str, u32&gt; = HashMap::new();

    for word in text.split_whitespace() {
        let count = word_count.entry(word).or_insert(0);
        *count += 1; // dereference the mutable reference to increment
    }

    println!("{:?}", word_count);
}</code></pre>
</div>

<pre class="output"><code>{"hello": 3, "world": 2, "wonderful": 1}</code></pre>

<p><code>entry(word)</code> returns an <code>Entry</code> representing the slot for that key. <code>or_insert(0)</code> returns a mutable reference (<code>&amp;mut u32</code>) to the value, inserting 0 if the key did not exist. Dereferencing with <code>*count += 1</code> increments the value in place.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The entry API is one of the most idiomatic patterns in Rust. It avoids the double-lookup that would be needed if you first called <code>contains_key</code> and then <code>insert</code>. Single lookup, single borrow, no wasted work.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting the use Statement</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: HashMap is not in the prelude
fn main() {
    let mut map = HashMap::new(); // error: not found in scope
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: bring HashMap into scope
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("key", "value");
}</code></pre>
</div>

<h3>Mistake 2: Passing the Key by Value to get() Instead of by Reference</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(String::from("name"), String::from("Alice"));

    let key = String::from("name");
    // BROKEN: get() takes a reference, not an owned value
    // let val = map.get(key); // type error
    let val = map.get(&amp;key);  // FIXED: pass a reference
    println!("{:?}", val);
}</code></pre>
</div>

<h3>Mistake 3: Using Index Syntax When the Key Might Not Exist</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

// BROKEN: panics if "unknown" is not a key
fn get_value(map: &amp;HashMap&lt;&amp;str, i32&gt;, key: &amp;str) -&gt; i32 {
    map[key] // panics with "key not found"
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::HashMap;

// FIXED: use get() which returns Option
fn get_value(map: &amp;HashMap&lt;&amp;str, i32&gt;, key: &amp;str) -&gt; i32 {
    map.get(key).copied().unwrap_or(0)
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 36: Result<T, E>
     --------------------------------------------------------------- */
  'ch36': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 36,
    title: 'Result&lt;T, E&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 36</span>
</div>

<h1>Result&lt;T, E&gt;: Handling Recoverable Errors</h1>

<p>Every program encounters situations where something might go wrong: a file might not exist, a number might be too large, a network connection might drop. In many languages, these situations are handled by throwing exceptions. Rust takes a different approach: operations that can fail return a <code>Result&lt;T, E&gt;</code> value. Your code must explicitly handle both outcomes: success and failure. This makes error handling visible, deliberate, and impossible to accidentally ignore.</p>

<h2>The Delivery Package Analogy</h2>

<p>Think of <code>Result</code> like a delivery package. When your package arrives, it is either in good shape with your item inside (<code>Ok(item)</code>), or it contains a sorry note explaining what went wrong (<code>Err(note)</code>). You cannot just assume it contains your item and tear it open: you have to check. Rust's type system enforces this check. Ignoring a <code>Result</code> generates a compiler warning, and using the value without checking generates a compile error.</p>

<h2>The Result Enum</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This is defined in the standard library.
// You do not need to write this yourself.
enum Result&lt;T, E&gt; {
    Ok(T),   // success: contains a value of type T
    Err(E),  // failure: contains an error of type E
}</code></pre>
</div>

<p><code>T</code> and <code>E</code> are generic type parameters. For <code>std::fs::File::open</code>, the success type is <code>File</code> and the error type is <code>io::Error</code>. The types change depending on the operation, but the two-variant structure is always the same.</p>

<h2>Matching on Result</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;

fn main() {
    let result = File::open("hello.txt");

    let file = match result {
        Ok(f)  => f,
        Err(e) => {
            println!("Could not open file: {}", e);
            return; // or panic!, or handle some other way
        }
    };

    println!("File opened successfully: {:?}", file);
}</code></pre>
</div>

<h2>Handling Different Error Kinds</h2>

<p>Sometimes you want to behave differently depending on the specific error. The <code>io::ErrorKind</code> enum lets you match on the category of the error:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let file = match File::open("hello.txt") {
        Ok(f) => f,
        Err(e) => match e.kind() {
            // If the file doesn't exist, create it
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(new_file) => new_file,
                Err(create_err) => panic!("Could not create file: {:?}", create_err),
            },
            // Any other error is fatal
            other_error => panic!("Problem opening file: {:?}", other_error),
        },
    };
    println!("Have a file handle: {:?}", file);
}</code></pre>
</div>

<h2>Shortcuts: unwrap and expect</h2>

<p>Matching on every <code>Result</code> is verbose. For quick scripts, prototypes, or cases where you are certain the operation will succeed, two helper methods are available:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;

fn main() {
    // unwrap(): returns the Ok value or panics with a generic message
    // let f = File::open("hello.txt").unwrap();

    // expect(): returns the Ok value or panics with YOUR message
    // The message appears in the panic output, making debugging easier
    let f = File::open("data.txt")
        .expect("data.txt must exist in the project directory");

    println!("File opened: {:?}", f);
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>In production code, most Rustaceans prefer <code>expect</code> over <code>unwrap</code>. A message like "config file should exist after installation" tells you <em>why</em> this value was assumed to be present, making panic messages much easier to diagnose.</p>
</div>

<h2>Handling Errors Without Match: unwrap_or and unwrap_or_else</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn parse_port(s: &amp;str) -&gt; u16 {
    // unwrap_or: return a default value on Err
    s.parse::&lt;u16&gt;().unwrap_or(8080)
}

fn parse_port_computed(s: &amp;str) -&gt; u16 {
    // unwrap_or_else: compute the default lazily with a closure
    s.parse::&lt;u16&gt;().unwrap_or_else(|_| {
        println!("Invalid port '{}', using default 8080", s);
        8080
    })
}

fn main() {
    println!("{}", parse_port("3000"));         // 3000
    println!("{}", parse_port("not_a_number")); // 8080
    println!("{}", parse_port_computed("bad")); // prints warning, then 8080
}</code></pre>
</div>

<pre class="output"><code>3000
8080
Invalid port 'bad', using default 8080
8080</code></pre>

<h2>Combining Results: is_ok, is_err, map, and_then</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn double_parse(s: &amp;str) -&gt; Result&lt;i32, &lt;i32 as std::str::FromStr&gt;::Err&gt; {
    s.parse::&lt;i32&gt;().map(|n| n * 2)  // transform Ok value, pass Err through
}

fn main() {
    let result = double_parse("21");
    println!("{:?}", result); // Ok(42)

    let bad = double_parse("abc");
    println!("{:?}", bad);    // Err(ParseIntError { ... })

    println!("is_ok: {}", result.is_ok());   // true
    println!("is_err: {}", bad.is_err());    // true
}</code></pre>
</div>

<pre class="output"><code>Ok(42)
Err(ParseIntError { kind: InvalidDigit })
is_ok: true
is_err: true</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Calling unwrap() on User-Provided Input</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: panics if the user types something that isn't a number
fn read_age(input: &amp;str) -&gt; u32 {
    input.trim().parse::&lt;u32&gt;().unwrap() // panic on bad input
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return a Result so the caller can handle bad input
fn read_age(input: &amp;str) -&gt; Result&lt;u32, std::num::ParseIntError&gt; {
    input.trim().parse::&lt;u32&gt;()
}

fn main() {
    match read_age("25") {
        Ok(age) =&gt; println!("Age: {}", age),
        Err(e)  =&gt; println!("Invalid age: {}", e),
    }
}</code></pre>
</div>

<h3>Mistake 2: Ignoring the Result Return Value</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;

// WRONG: the write might fail silently
fn main() {
    File::create("output.txt"); // warning: unused Result — error is silently dropped
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;

// FIXED: handle or explicitly acknowledge the result
fn main() {
    let _ = File::create("output.txt"); // explicit discard if you truly don't care
    // OR
    File::create("output.txt").expect("Could not create output file");
}</code></pre>
</div>

<h3>Mistake 3: Using match When map or and_then Is Cleaner</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// VERBOSE: unnecessary match to transform an Ok value
fn double(s: &amp;str) -&gt; Result&lt;i32, _&gt; {
    match s.parse::&lt;i32&gt;() {
        Ok(n)  =&gt; Ok(n * 2),
        Err(e) =&gt; Err(e),
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CLEANER: use map to transform the Ok value
fn double(s: &amp;str) -&gt; Result&lt;i32, std::num::ParseIntError&gt; {
    s.parse::&lt;i32&gt;().map(|n| n * 2)
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 37: Option<T>
     --------------------------------------------------------------- */
  'ch37': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 37,
    title: 'Option&lt;T&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 37</span>
</div>

<h1>Option&lt;T&gt;: Values That Might Not Exist</h1>

<p>Many programs need to express the idea that a value might or might not be present: the first element of an empty list, the result of a search that found nothing, a user field that was not filled in. In languages like Java, C, and Python, the traditional answer is <code>null</code>. Rust does not have null. Instead it has <code>Option&lt;T&gt;</code>: an explicit type that forces you to handle both the "present" and "absent" cases at compile time.</p>

<h2>The Gift Box Analogy</h2>

<p>Think of <code>Option&lt;T&gt;</code> as a gift box. The box is either sealed with something inside (<code>Some(value)</code>) or it is empty (<code>None</code>). Before you can use the value, you must open the box and check. You cannot reach through the side and grab the contents without first confirming the box is not empty. This is exactly what null pointer exceptions are in other languages: reaching into a box that turned out to be empty. Rust's type system prevents this by making the "might be empty" nature of the box visible in the type itself.</p>

<h2>The Option Enum</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Defined in the standard library and always in scope (no use needed).
enum Option&lt;T&gt; {
    Some(T),  // contains a value of type T
    None,     // no value
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let some_number: Option&lt;i32&gt; = Some(42);
    let some_text:   Option&lt;&amp;str&gt; = Some("hello");
    let nothing:     Option&lt;i32&gt; = None;

    println!("{:?}", some_number); // Some(42)
    println!("{:?}", some_text);   // Some("hello")
    println!("{:?}", nothing);     // None

    // The key difference from null: you CANNOT use some_number as an i32.
    // let doubled = some_number * 2; // error: type mismatch
    // You must unwrap it first.
}</code></pre>
</div>

<h2>Matching on Option</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn divide(a: f64, b: f64) -&gt; Option&lt;f64&gt; {
    if b == 0.0 {
        None
    } else {
        Some(a / b)
    }
}

fn main() {
    let result = divide(10.0, 3.0);

    match result {
        Some(val) =&gt; println!("Result: {:.3}", val), // 3.333
        None      =&gt; println!("Cannot divide by zero"),
    }

    match divide(5.0, 0.0) {
        Some(val) =&gt; println!("Result: {}", val),
        None      =&gt; println!("Cannot divide by zero"),
    }
}</code></pre>
</div>

<pre class="output"><code>Result: 3.333
Cannot divide by zero</code></pre>

<h2>Convenient Methods on Option</h2>

<p>Writing a full <code>match</code> expression every time is verbose. The standard library provides many methods that make common patterns concise:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let some_val: Option&lt;i32&gt; = Some(5);
    let no_val:   Option&lt;i32&gt; = None;

    // unwrap_or: return the value or a default
    println!("{}", some_val.unwrap_or(0)); // 5
    println!("{}", no_val.unwrap_or(0));   // 0

    // unwrap_or_else: compute the default lazily
    println!("{}", no_val.unwrap_or_else(|| 42)); // 42

    // is_some / is_none: check without extracting
    println!("{}", some_val.is_some()); // true
    println!("{}", no_val.is_none());   // true

    // map: transform the value inside Some, leave None alone
    let doubled = some_val.map(|n| n * 2);
    println!("{:?}", doubled); // Some(10)
    let also_none = no_val.map(|n| n * 2);
    println!("{:?}", also_none); // None

    // filter: keep Some only if the predicate holds
    let even = Some(4).filter(|n| n % 2 == 0);
    let odd  = Some(3).filter(|n| n % 2 == 0);
    println!("{:?} {:?}", even, odd); // Some(4) None
}</code></pre>
</div>

<pre class="output"><code>5
0
42
true
true
Some(10)
None
Some(4) None</code></pre>

<h2>Chaining with and_then</h2>

<p><code>and_then</code> (also called "flat map" in other languages) lets you chain operations that each might return <code>None</code>. If any step returns <code>None</code>, the entire chain short-circuits to <code>None</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn parse_positive(s: &amp;str) -&gt; Option&lt;u32&gt; {
    s.parse::&lt;i64&gt;().ok()            // parse: Result to Option
       .filter(|&amp;n| n &gt; 0)           // keep only positive
       .map(|n| n as u32)            // convert to u32
}

fn main() {
    println!("{:?}", parse_positive("42"));   // Some(42)
    println!("{:?}", parse_positive("-5"));   // None (not positive)
    println!("{:?}", parse_positive("abc"));  // None (parse failed)
    println!("{:?}", parse_positive("0"));    // None (zero not positive)
}</code></pre>
</div>

<pre class="output"><code>Some(42)
None
None
None</code></pre>

<h2>Option in Practice: Collection Methods</h2>

<p>Many standard library methods return <code>Option</code>. Recognizing the pattern makes these APIs intuitive:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let names = vec!["Alice", "Bob", "Carol"];

    // Vec::get() returns Option&lt;&amp;T&gt;
    println!("{:?}", names.get(1));  // Some("Bob")
    println!("{:?}", names.get(99)); // None

    // Iterator::find() returns Option&lt;&amp;T&gt;
    let found = names.iter().find(|&amp;&amp;name| name.starts_with('B'));
    println!("{:?}", found); // Some("Bob")

    // str::find() returns Option&lt;usize&gt; (byte index)
    let text = "hello world";
    println!("{:?}", text.find('w'));   // Some(6)
    println!("{:?}", text.find('z'));   // None

    // Iterator::max() returns Option&lt;&amp;T&gt; (empty iterator has no max)
    let numbers = vec![3, 1, 4, 1, 5, 9];
    println!("{:?}", numbers.iter().max()); // Some(9)
    let empty: Vec&lt;i32&gt; = vec![];
    println!("{:?}", empty.iter().max());   // None
}</code></pre>
</div>

<pre class="output"><code>Some("Bob")
None
Some("Bob")
Some(6)
None
Some(9)
None</code></pre>

<h2>Converting Between Option and Result</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Option to Result: provide an error value for the None case
    let maybe: Option&lt;i32&gt; = Some(42);
    let result: Result&lt;i32, &amp;str&gt; = maybe.ok_or("no value found");
    println!("{:?}", result); // Ok(42)

    let nothing: Option&lt;i32&gt; = None;
    let err: Result&lt;i32, &amp;str&gt; = nothing.ok_or("no value found");
    println!("{:?}", err); // Err("no value found")

    // Result to Option: discard the error value
    let res: Result&lt;i32, &amp;str&gt; = Ok(5);
    println!("{:?}", res.ok()); // Some(5)

    let bad: Result&lt;i32, &amp;str&gt; = Err("oops");
    println!("{:?}", bad.ok()); // None
}</code></pre>
</div>

<pre class="output"><code>Ok(42)
Err("no value found")
Some(5)
None</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Calling unwrap() on an Option That Might Be None</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: panics if the vector is empty
fn first_item(items: &amp;[i32]) -&gt; i32 {
    items.first().unwrap() // panic if items is empty
               .copied()   // (actually: compile error — fix order first)
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: return Option so caller decides what to do with empty input
fn first_item(items: &amp;[i32]) -&gt; Option&lt;i32&gt; {
    items.first().copied()
}

fn main() {
    let v = vec![10, 20, 30];
    println!("{:?}", first_item(&amp;v));  // Some(10)
    println!("{:?}", first_item(&amp;[])); // None
}</code></pre>
</div>

<h3>Mistake 2: Comparing to None with == Instead of Using is_none()</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WORKS but verbose
fn check(opt: Option&lt;i32&gt;) {
    if opt == None {
        println!("nothing here");
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// IDIOMATIC: use is_none() or pattern match
fn check(opt: Option&lt;i32&gt;) {
    if opt.is_none() {
        println!("nothing here");
    }
    // Or more idiomatically:
    if let Some(val) = opt {
        println!("found: {}", val);
    }
}</code></pre>
</div>

<h3>Mistake 3: Nesting Options Instead of Using and_then</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// VERBOSE: nested match is hard to read
fn process(input: &amp;str) -&gt; Option&lt;u32&gt; {
    match input.parse::&lt;i32&gt;().ok() {
        Some(n) =&gt; match n.checked_abs() {
            Some(abs) =&gt; Some(abs as u32),
            None =&gt; None,
        },
        None =&gt; None,
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CLEANER: chain with and_then and map
fn process(input: &amp;str) -&gt; Option&lt;u32&gt; {
    input.parse::&lt;i32&gt;().ok()
         .and_then(|n| n.checked_abs())
         .map(|n| n as u32)
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 38: Error Propagation (?)
     --------------------------------------------------------------- */
  'ch38': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 38,
    title: 'Error Propagation (?)',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 38</span>
</div>

<h1>Error Propagation: The ? Operator</h1>

<p>When a function calls another function that can fail, it often does not know what to do with the error itself. The right response is to pass the error up to the caller and let the caller decide. This is called <strong>error propagation</strong>. Rust makes propagation effortless with the <code>?</code> operator: a single character that handles early return on error, optionally converts the error type, and keeps your code readable.</p>

<h2>The Relay Race Analogy</h2>

<p>Think of error propagation like a relay race where a team passes a baton. If a runner drops the baton (an error occurs), they do not try to fix it themselves: they immediately hand the dropped-baton situation up to the coach (the caller). The coach knows the bigger picture and can decide what to do: disqualify the team, substitute a runner, or handle it some other way. The runner's only job is to notify the coach and stop running. The <code>?</code> operator is the hand-off moment: it either continues the race (Ok value) or signals the coach (Err early return).</p>

<h2>Manual Propagation Without ?</h2>

<p>Here is a function that reads a username from a file. Without <code>?</code>, propagating errors requires verbose match expressions:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -&gt; Result&lt;String, io::Error&gt; {
    let file_result = File::open("username.txt");

    let mut file = match file_result {
        Ok(f)  =&gt; f,
        Err(e) =&gt; return Err(e), // early return with the error
    };

    let mut username = String::new();

    match file.read_to_string(&amp;mut username) {
        Ok(_)  =&gt; Ok(username),
        Err(e) =&gt; Err(e),
    }
}</code></pre>
</div>

<p>This is correct but repetitive. Every operation follows the same pattern: if Ok, continue; if Err, return early. That pattern is exactly what <code>?</code> automates.</p>

<h2>The ? Operator</h2>

<p>The <code>?</code> placed after a <code>Result</code> expression does the following:</p>
<ul>
  <li>If the result is <code>Ok(val)</code>: unwrap it to <code>val</code> and continue execution.</li>
  <li>If the result is <code>Err(e)</code>: immediately return <code>Err(e)</code> from the current function.</li>
</ul>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;
use std::io::{self, Read};

// Same function as above, rewritten with ?
fn read_username_from_file() -&gt; Result&lt;String, io::Error&gt; {
    let mut file = File::open("username.txt")?; // return Err if open fails
    let mut username = String::new();
    file.read_to_string(&amp;mut username)?;        // return Err if read fails
    Ok(username)
}</code></pre>
</div>

<p>The <code>?</code> after <code>File::open("username.txt")</code> means: if opening the file fails, return the error immediately; otherwise, give me the open file handle. Two lines replace twelve.</p>

<h2>Chaining ? Calls</h2>

<p>You can chain multiple <code>?</code> calls on one expression for even more concise code:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -&gt; Result&lt;String, io::Error&gt; {
    let mut username = String::new();
    File::open("username.txt")?.read_to_string(&amp;mut username)?;
    Ok(username)
}

// Even shorter: the standard library has read_to_string built in
use std::fs;

fn read_username_v3() -&gt; Result&lt;String, io::Error&gt; {
    fs::read_to_string("username.txt")
}</code></pre>
</div>

<h2>How ? Converts Error Types (the From Trait)</h2>

<p>One powerful feature of <code>?</code> is that it automatically converts the error type using the <code>From</code> trait. If your function returns <code>Result&lt;T, MyError&gt;</code> and you use <code>?</code> on something that returns <code>Result&lt;T, OtherError&gt;</code>, Rust will call <code>MyError::from(other_error)</code> to convert it, as long as you have implemented (or derived) the conversion:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::num::ParseIntError;
use std::fmt;

#[derive(Debug)]
enum AppError {
    ParseError(ParseIntError),
    NegativeNumber,
}

impl From&lt;ParseIntError&gt; for AppError {
    fn from(e: ParseIntError) -&gt; Self {
        AppError::ParseError(e)
    }
}

fn parse_positive(s: &amp;str) -&gt; Result&lt;u32, AppError&gt; {
    let n: i32 = s.parse()?; // ParseIntError is automatically converted to AppError
    if n &lt; 0 {
        return Err(AppError::NegativeNumber);
    }
    Ok(n as u32)
}

fn main() {
    println!("{:?}", parse_positive("42"));   // Ok(42)
    println!("{:?}", parse_positive("-5"));   // Err(NegativeNumber)
    println!("{:?}", parse_positive("abc"));  // Err(ParseError(...))
}</code></pre>
</div>

<pre class="output"><code>Ok(42)
Err(NegativeNumber)
Err(ParseError(invalid digit found in string))</code></pre>

<h2>Using ? in main()</h2>

<p>The <code>?</code> operator can only be used inside a function that returns <code>Result</code> or <code>Option</code>. By default, <code>main()</code> returns <code>()</code>, which is incompatible. But <code>main</code> can be declared to return <code>Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt;</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs;
use std::num::ParseIntError;

fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt; {
    let content = fs::read_to_string("number.txt")?; // propagate io::Error
    let n: i32 = content.trim().parse()?;            // propagate ParseIntError
    println!("The number is: {}", n);
    Ok(())
}</code></pre>
</div>

<p><code>Box&lt;dyn std::error::Error&gt;</code> is a trait object that can hold any type implementing the <code>Error</code> trait. This lets you use <code>?</code> with multiple different error types in one function without needing a custom error enum.</p>

<h2>? with Option</h2>

<p>The <code>?</code> operator also works in functions that return <code>Option&lt;T&gt;</code>. It unwraps <code>Some</code> or returns <code>None</code> early:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn last_char_of_first_line(text: &amp;str) -&gt; Option&lt;char&gt; {
    text.lines().next()?.chars().last()
    // text.lines().next() returns Option&lt;&amp;str&gt;
    // ? returns None if there are no lines
    // .chars().last() returns Option&lt;char&gt;
}

fn main() {
    println!("{:?}", last_char_of_first_line("Hello\nworld")); // Some('o')
    println!("{:?}", last_char_of_first_line(""));              // None
    println!("{:?}", last_char_of_first_line("\nsecond"));      // None (first line is empty)
}</code></pre>
</div>

<pre class="output"><code>Some('o')
None
None</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using ? in a Function That Returns ()</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;

// BROKEN: main() returns () by default, ? cannot be used
fn main() {
    let _f = File::open("hello.txt")?; // error: cannot use ? in function returning ()
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs::File;

// FIXED option 1: change main's return type
fn main() -&gt; Result&lt;(), Box&lt;dyn std::error::Error&gt;&gt; {
    let _f = File::open("hello.txt")?;
    Ok(())
}

// FIXED option 2: use match or expect instead
fn main() {
    let _f = File::open("hello.txt").expect("Could not open file");
}</code></pre>
</div>

<h3>Mistake 2: Mixing ? on Result and Option in the Same Function</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs;

// BROKEN: function returns Result but uses ? on an Option
fn first_line(path: &amp;str) -&gt; Result&lt;String, std::io::Error&gt; {
    let content = fs::read_to_string(path)?;     // Ok: returns Result
    let line = content.lines().next()?;           // Error: returns Option, but function returns Result
    Ok(line.to_string())
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs;
use std::io;

// FIXED: convert Option to Result before using ?
fn first_line(path: &amp;str) -&gt; Result&lt;String, io::Error&gt; {
    let content = fs::read_to_string(path)?;
    let line = content.lines().next()
        .ok_or(io::Error::new(io::ErrorKind::UnexpectedEof, "file is empty"))?;
    Ok(line.to_string())
}</code></pre>
</div>

<h3>Mistake 3: Forgetting to Return Ok(()) at the End of a Result Function</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: missing Ok(()) at the end
fn do_work() -&gt; Result&lt;(), std::io::Error&gt; {
    std::fs::write("out.txt", "hello")?;
    // missing Ok(())
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: always end with Ok(()) in Result&lt;(), E&gt; functions
fn do_work() -&gt; Result&lt;(), std::io::Error&gt; {
    std::fs::write("out.txt", "hello")?;
    Ok(())
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 39: Custom Error Types
     --------------------------------------------------------------- */
  'ch39': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 39,
    title: 'Custom Error Types',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 39</span>
</div>

<h1>Custom Error Types</h1>

<p>The standard library provides general error types like <code>io::Error</code> and <code>ParseIntError</code>. But real programs often encounter domain-specific failures: a configuration file with a missing required field, a database query that violates a business rule, a protocol message that is too long. For these situations, you define your own error types. Custom error types make failure cases self-documenting, allow callers to handle each case specifically, and integrate cleanly with the <code>?</code> operator.</p>

<h2>The Custom Form Analogy</h2>

<p>Think of a generic error like a blank sticky note: it says "something went wrong" but no more. A custom error type is like a purpose-built error report form: it has specific fields for the problem code, the affected resource, and the recommended action. When someone receives the form, they immediately know what happened and what they can do about it. Custom error types give your callers the same advantage.</p>

<h2>The Simplest Approach: Box&lt;dyn Error&gt;</h2>

<p>The quickest way to handle multiple error types without defining your own is to return <code>Box&lt;dyn std::error::Error&gt;</code>. This works with <code>?</code> and accepts any error type:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs;
use std::num::ParseIntError;

fn read_count(path: &amp;str) -&gt; Result&lt;u32, Box&lt;dyn std::error::Error&gt;&gt; {
    let content = fs::read_to_string(path)?;        // io::Error
    let count: u32 = content.trim().parse()?;       // ParseIntError
    Ok(count)
}

fn main() {
    match read_count("count.txt") {
        Ok(n)  =&gt; println!("Count: {}", n),
        Err(e) =&gt; println!("Error: {}", e),
    }
}</code></pre>
</div>

<p>The downside: callers cannot match on the specific error variant. For library code or APIs where callers need to distinguish between error types, define an explicit custom error type.</p>

<h2>Defining an Error Enum</h2>

<p>A custom error type is typically an enum where each variant represents a distinct failure mode:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::num::ParseIntError;
use std::fmt;

#[derive(Debug)]
enum ConfigError {
    MissingField(String),
    InvalidValue { field: String, value: String },
    ParseFailed(ParseIntError),
}

// Step 1: Implement Display so the error can be printed.
impl fmt::Display for ConfigError {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter&lt;'_&gt;) -&gt; fmt::Result {
        match self {
            ConfigError::MissingField(name) =&gt;
                write!(f, "missing required field: {}", name),
            ConfigError::InvalidValue { field, value } =&gt;
                write!(f, "invalid value '{}' for field '{}'", value, field),
            ConfigError::ParseFailed(e) =&gt;
                write!(f, "could not parse integer: {}", e),
        }
    }
}

// Step 2: Implement the Error trait.
// All required methods have defaults — you only need the impl block.
impl std::error::Error for ConfigError {
    fn source(&amp;self) -&gt; Option&lt;&amp;(dyn std::error::Error + 'static)&gt; {
        match self {
            ConfigError::ParseFailed(e) =&gt; Some(e), // chain the source error
            _ =&gt; None,
        }
    }
}

// Step 3: Implement From so ? can convert ParseIntError automatically.
impl From&lt;ParseIntError&gt; for ConfigError {
    fn from(e: ParseIntError) -&gt; Self {
        ConfigError::ParseFailed(e)
    }
}

fn parse_timeout(s: &amp;str) -&gt; Result&lt;u32, ConfigError&gt; {
    if s.is_empty() {
        return Err(ConfigError::MissingField("timeout".to_string()));
    }
    let n: i64 = s.parse()?; // ParseIntError auto-converted via From
    if n &lt; 0 {
        return Err(ConfigError::InvalidValue {
            field: "timeout".to_string(),
            value: s.to_string(),
        });
    }
    Ok(n as u32)
}

fn main() {
    println!("{:?}", parse_timeout("30"));   // Ok(30)
    println!("{}", parse_timeout("").unwrap_err());    // missing required field: timeout
    println!("{}", parse_timeout("-5").unwrap_err());  // invalid value '-5' for field 'timeout'
    println!("{}", parse_timeout("abc").unwrap_err()); // could not parse integer: ...
}</code></pre>
</div>

<pre class="output"><code>Ok(30)
missing required field: timeout
invalid value '-5' for field 'timeout'
could not parse integer: invalid digit found in string</code></pre>

<h2>The Three Requirements for an Idiomatic Error Type</h2>

<dl>
  <dt>1. Implement Debug (via #[derive(Debug)])</dt>
  <dd>Required as a supertrait of <code>std::error::Error</code>. Also enables the <code>{:?}</code> format specifier for debugging.</dd>
  <dt>2. Implement Display</dt>
  <dd>Provides the human-readable message shown to end users. Required as a supertrait of <code>std::error::Error</code>.</dd>
  <dt>3. Implement std::error::Error</dt>
  <dd>Marks the type as an error. The <code>source()</code> method optionally returns the underlying cause, enabling error chaining.</dd>
</dl>

<h2>Displaying Error Chains</h2>

<p>The <code>source()</code> method lets you follow the chain of errors that caused the problem. Here is how to print a full chain:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::error::Error;

fn print_error_chain(e: &amp;dyn Error) {
    println!("Error: {}", e);
    let mut source = e.source();
    while let Some(cause) = source {
        println!("  caused by: {}", cause);
        source = cause.source();
    }
}

fn main() {
    let bad: Result&lt;u32, _&gt; = "abc".parse::&lt;u32&gt;();
    if let Err(e) = bad {
        // Wrap in our custom error to demonstrate chaining
        let config_err = ConfigError::ParseFailed(e);
        print_error_chain(&amp;config_err);
    }
}</code></pre>
</div>

<pre class="output"><code>Error: could not parse integer: invalid digit found in string
  caused by: invalid digit found in string</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting to Implement Display</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[derive(Debug)]
enum MyError { NotFound }

// BROKEN: std::error::Error requires Display, but Display is not implemented
impl std::error::Error for MyError {}

// This compiles but you cannot print the error with {}
// println!("{}", MyError::NotFound); // error: Display not implemented</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

#[derive(Debug)]
enum MyError { NotFound }

impl fmt::Display for MyError {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter&lt;'_&gt;) -&gt; fmt::Result {
        match self {
            MyError::NotFound =&gt; write!(f, "item not found"),
        }
    }
}

impl std::error::Error for MyError {}</code></pre>
</div>

<h3>Mistake 2: Returning String as an Error Type</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WORKS but is not idiomatic or composable
fn find_user(id: u32) -&gt; Result&lt;String, String&gt; {
    if id == 0 {
        Err(String::from("user not found")) // caller cannot pattern match on error variant
    } else {
        Ok(String::from("Alice"))
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BETTER: use a proper error enum
#[derive(Debug)]
enum UserError { NotFound(u32) }

impl std::fmt::Display for UserError {
    fn fmt(&amp;self, f: &amp;mut std::fmt::Formatter&lt;'_&gt;) -&gt; std::fmt::Result {
        match self {
            UserError::NotFound(id) =&gt; write!(f, "user {} not found", id),
        }
    }
}
impl std::error::Error for UserError {}

fn find_user(id: u32) -&gt; Result&lt;String, UserError&gt; {
    if id == 0 { Err(UserError::NotFound(0)) } else { Ok(String::from("Alice")) }
}</code></pre>
</div>

<h3>Mistake 3: Implementing Error Without the source() Method for Wrapped Errors</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BROKEN: wraps io::Error but hides it from error-chain tools
#[derive(Debug)]
struct IoWrapper(std::io::Error);

impl std::fmt::Display for IoWrapper {
    fn fmt(&amp;self, f: &amp;mut std::fmt::Formatter&lt;'_&gt;) -&gt; std::fmt::Result {
        write!(f, "io error: {}", self.0)
    }
}
impl std::error::Error for IoWrapper {} // source() returns None by default</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// FIXED: implement source() to expose the wrapped error
impl std::error::Error for IoWrapper {
    fn source(&amp;self) -&gt; Option&lt;&amp;(dyn std::error::Error + 'static)&gt; {
        Some(&amp;self.0) // callers can traverse the error chain
    }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 40: Panic Strategy
     --------------------------------------------------------------- */
  'ch40': {
    moduleNum: 6,
    moduleTitle: 'Collections &amp; Error Handling',
    chNum: 40,
    title: 'Panic Strategy',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 6 &mdash; Chapter 40</span>
</div>

<h1>Panic Strategy: When Things Go Unrecoverably Wrong</h1>

<p>The previous chapters covered recoverable errors: situations where a reasonable program can detect the problem, handle it, and continue running. But some situations are not recoverable: a bug in your own code violated an invariant that should never have been possible, or the program entered a state that makes further execution meaningless. For these situations, Rust provides <code>panic!</code>.</p>

<h2>The Emergency Exit Analogy</h2>

<p>Every building has normal exits and emergency exits. You use the normal exit every day. The emergency exit is for fires and earthquakes: situations where the building is no longer safe and you must leave immediately regardless of what you were doing. Panicking is the emergency exit of your program. Using it for everyday errors (like a file not found) would be as strange as using the emergency exit because the elevator is slow. The goal is to reserve panics for genuine emergencies: bugs, violated contracts, and states that should be impossible.</p>

<h2>What panic! Does</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    panic!("crash and burn");
}</code></pre>
</div>

<pre class="output"><code>thread 'main' panicked at src/main.rs:2:5:
crash and burn
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace</code></pre>

<p>When a panic occurs, Rust prints the failure message and the location (file, line, column), then by default <em>unwinds</em> the stack: it walks back through each function, dropping all values along the way, then exits the process.</p>

<h2>Panics Triggered by the Standard Library</h2>

<p>You do not have to call <code>panic!</code> yourself to cause a panic. Many standard library operations panic when used incorrectly:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Index out of bounds: panics at runtime
    let v = vec![1, 2, 3];
    println!("{}", v[99]);
}
</code></pre>
</div>

<pre class="output"><code>thread 'main' panicked at src/main.rs:4:20:
index out of bounds: the len is 3 but the index is 99</code></pre>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // unwrap() on None: panics
    let v: Vec&lt;i32&gt; = vec![];
    let _first = v.first().unwrap();
}
</code></pre>
</div>

<pre class="output"><code>thread 'main' panicked at src/main.rs:4:28:
called \`Option::unwrap()\` on a \`None\` value</code></pre>

<h2>Unwinding vs Aborting</h2>

<p>By default, when a panic occurs Rust unwinds the stack and cleans up. Unwinding is safe and predictable, but it generates extra code. In release builds where you want the smallest possible binary, you can configure Rust to <em>abort</em> immediately instead: the OS reclaims all memory without any cleanup code running:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># In Cargo.toml
[profile.release]
panic = 'abort'</code></pre>
</div>

<p>Use <code>panic = 'abort'</code> only when you are certain no cleanup is needed (or when binary size is a hard constraint, such as embedded systems). For most applications, the default unwinding behavior is correct.</p>

<h2>Diagnosing Panics: RUST_BACKTRACE</h2>

<p>The panic message tells you the file and line, but not the call stack that led there. Set <code>RUST_BACKTRACE=1</code> to see the full backtrace:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">RUST_BACKTRACE=1 cargo run</code></pre>
</div>

<pre class="output"><code>thread 'main' panicked at src/main.rs:4:20:
index out of bounds: the len is 3 but the index is 99
stack backtrace:
   0: rust_begin_unwind
   1: core::panicking::panic_fmt
   2: core::slice::index::...
   3: myapp::main
             at ./src/main.rs:4:20</code></pre>

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body">
    <p>Start reading from the bottom of the backtrace, not the top.</p>
  </div>
</div>
<div class="step">
  <div class="step-num">2</div>
  <div class="step-body">
    <p>Find the first frame that shows a file path you own (e.g., <code>./src/main.rs</code>).</p>
  </div>
</div>
<div class="step">
  <div class="step-num">3</div>
  <div class="step-body">
    <p>That line is where your code triggered the panic. Fix the issue there.</p>
  </div>
</div>

<h2>When to panic! vs Return Result</h2>

<p>The choice between panicking and returning <code>Result</code> is one of the most important design decisions in Rust. Here is a practical decision guide:</p>

<dl>
  <dt>Panic when the situation is a programmer error</dt>
  <dd>If the caller violated a contract your function documented (passing a negative index to a function that requires non-negative indices), panicking is appropriate. The bug is in the calling code, not yours.</dd>
  <dt>Return Result when the situation is an expected failure</dt>
  <dd>Files not existing, network timeouts, malformed user input, parsing errors: these happen in correct programs. Return <code>Result</code> so the caller can decide how to handle them.</dd>
  <dt>Panic in tests</dt>
  <dd>Using <code>unwrap</code> and <code>expect</code> in test code is fine. If an assertion fails, you want the test to fail loudly. There is no caller to propagate to.</dd>
  <dt>Panic in prototypes and examples</dt>
  <dd>During early development, <code>unwrap()</code> and <code>expect()</code> let you focus on the logic before wiring up error handling. Mark these with a comment to revisit.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// APPROPRIATE panic: the function contract requires a non-empty slice.
// If the caller passes empty, that is a programmer error.
fn average(nums: &amp;[f64]) -&gt; f64 {
    assert!(!nums.is_empty(), "average requires at least one number");
    nums.iter().sum::&lt;f64&gt;() / nums.len() as f64
}

// APPROPRIATE Result: parsing user input can legitimately fail.
fn parse_temperature(s: &amp;str) -&gt; Result&lt;f64, std::num::ParseFloatError&gt; {
    s.trim().parse::&lt;f64&gt;()
}

fn main() {
    println!("{:.2}", average(&amp;[1.0, 2.0, 3.0])); // 2.00
    println!("{:?}", parse_temperature("98.6"));   // Ok(98.6)
    println!("{:?}", parse_temperature("hot"));    // Err(...)
}</code></pre>
</div>

<pre class="output"><code>2.00
Ok(98.6)
Err(ParseFloatError { kind: Invalid })</code></pre>

<h2>Using assert! and assert_eq! for Invariants</h2>

<p><code>assert!</code> and <code>assert_eq!</code> are the idiomatic way to document and enforce invariants. They compile to panics when the condition is not met:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn set_age(age: u8) {
    assert!(age &lt;= 150, "age {} is unrealistic", age);
    println!("Age set to {}", age);
}

fn add(a: i32, b: i32) -&gt; i32 {
    let result = a + b;
    assert_eq!(result, a + b); // tautological here, but useful in complex logic
    result
}

fn main() {
    set_age(25);   // fine
    // set_age(200); // panics: age 200 is unrealistic
}</code></pre>
</div>

<pre class="output"><code>Age set to 25</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Panicking on Expected Failures</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs;

// WRONG: file not found is an expected situation, not a programmer error
fn load_config(path: &amp;str) -&gt; String {
    fs::read_to_string(path).unwrap() // panics if file doesn't exist
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fs;

// CORRECT: return a Result so the caller can handle the missing file
fn load_config(path: &amp;str) -&gt; Result&lt;String, std::io::Error&gt; {
    fs::read_to_string(path)
}</code></pre>
</div>

<h3>Mistake 2: Using unwrap in Library Code</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WRONG: library functions should not panic on recoverable errors.
// The caller cannot recover from a panic — they can only recover from Err.
pub fn parse_config(input: &amp;str) -&gt; Config {
    serde_json::from_str(input).unwrap() // forces panic on bad JSON
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// CORRECT: return Result from public library functions
pub fn parse_config(input: &amp;str) -&gt; Result&lt;Config, serde_json::Error&gt; {
    serde_json::from_str(input)
}</code></pre>
</div>

<h3>Mistake 3: Not Using RUST_BACKTRACE When Debugging a Panic</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># WRONG: running without backtrace gives minimal information
cargo run

# CORRECT: always use RUST_BACKTRACE=1 when investigating a panic
RUST_BACKTRACE=1 cargo run

# For maximum detail:
RUST_BACKTRACE=full cargo run</code></pre>
</div>
`
  },

});
