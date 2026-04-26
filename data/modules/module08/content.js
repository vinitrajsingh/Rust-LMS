Object.assign(CHAPTERS_CONTENT, {
  'ch48': {
    moduleNum: 8,
    moduleTitle: 'Iterators, Closures & Functional Rust',
    chNum: 48,
    title: 'Closures',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 8 &mdash; Chapter 48</span>
</div>
<h1>Closures</h1>

<p>Imagine writing a note to yourself that says "take this number and double it." You can carry that note around and hand it to anyone who needs it, and they can follow the instructions later. A closure in Rust works exactly like that sticky note: it is a small anonymous function you can create, store in a variable, and pass around. The extra power of a closure is that it can "remember" variables from the place where it was created.</p>

<h2>What Is a Closure?</h2>

<p>A closure is an anonymous function defined with vertical bars <code>|params|</code> instead of the <code>fn</code> keyword. Unlike regular functions, closures can capture values from their surrounding scope.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let add_one = |x| x + 1;      // closure stored in a variable
    println!("{}", add_one(5));   // prints 6

    let greeting = "Hello";
    let greet = |name| println!("{}, {}!", greeting, name); // captures greeting
    greet("Alice");               // prints: Hello, Alice!
}</code></pre>
</div>

<p>Key differences from functions:</p>
<ul>
  <li>Parameter types are usually inferred, not required</li>
  <li>The body can be a single expression (no braces needed) or a block</li>
  <li>Closures can access variables from the surrounding scope</li>
</ul>

<h2>Closure Syntax</h2>

<p>There are a few valid ways to write a closure, from compact to explicit:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // Fully explicit (looks almost like a function)
    let add = |x: i32, y: i32| -> i32 { x + y };

    // Type-inferred single expression
    let multiply = |x, y| x * y;

    // Multi-line block body
    let describe = |n: i32| {
        if n > 0 {
            println!("{} is positive", n);
        } else {
            println!("{} is non-positive", n);
        }
    };

    println!("{}", add(3, 4));       // 7
    println!("{}", multiply(3, 4));  // 12
    describe(-2);                    // -2 is non-positive
}</code></pre>
</div>

<h2>How Closures Capture Their Environment</h2>

<p>Think of capturing like taking a photograph. The closure takes a snapshot of variables it uses from the surrounding scope. Rust does this in the least intrusive way possible:</p>

<ul>
  <li>If possible, it borrows the value (<code>&amp;T</code>)</li>
  <li>If it needs to modify, it borrows mutably (<code>&amp;mut T</code>)</li>
  <li>If it needs to own the value, it moves it</li>
</ul>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let message = String::from("hello");

    // Borrows message by reference
    let print_msg = || println!("{}", message);
    print_msg();
    println!("still have: {}", message); // message still accessible

    let mut count = 0;

    // Borrows count mutably to modify it
    let mut increment = || {
        count += 1;
        println!("count is {}", count);
    };
    increment();
    increment();
    // println!("{}", count); // would error here while increment is alive
}</code></pre>
</div>

<h2>The move Keyword</h2>

<p>Sometimes you need the closure to own its captured values, not just borrow them. This is common when sending closures to other threads. Use the <code>move</code> keyword to force the closure to take ownership.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let name = String::from("Alice");

    // move forces the closure to own \`name\`
    let greet = move || println!("Hello, {}!", name);

    // name has been moved into the closure
    // println!("{}", name); // compile error: value moved

    greet();
    greet(); // can call multiple times because greet owns name
}</code></pre>
</div>

<h2>The Fn Traits: Fn, FnMut, FnOnce</h2>

<p>Every closure implements one or more of three traits, depending on how it uses its captured values. Think of these as different "usage contracts":</p>

<dl>
  <dt><code>FnOnce</code></dt>
  <dd>Can be called at least once. If the closure consumes (moves out of) a captured value, it can only be called once because the value is gone after the first call. All closures implement FnOnce.</dd>
  <dt><code>FnMut</code></dt>
  <dd>Can be called multiple times and may mutate captured values. Implements FnOnce.</dd>
  <dt><code>Fn</code></dt>
  <dd>Can be called multiple times without mutating or consuming captured values. Implements both FnMut and FnOnce.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn apply_twice&lt;F: Fn(i32) -&gt; i32&gt;(f: F, x: i32) -&gt; i32 {
    f(f(x))
}

fn apply_mut&lt;F: FnMut()&gt;(mut f: F) {
    f();
    f();
}

fn consume_once&lt;F: FnOnce()&gt;(f: F) {
    f(); // can only call once
}

fn main() {
    let double = |x| x * 2;
    println!("{}", apply_twice(double, 3)); // 12

    let mut n = 0;
    apply_mut(|| { n += 1; println!("n={}", n); });

    let msg = String::from("bye");
    consume_once(move || println!("{}", msg)); // msg moved into closure
}</code></pre>
</div>

<h2>Storing Closures in Structs</h2>

<p>When you need to store a closure inside a struct, you use a generic type parameter with a trait bound:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Cacher&lt;T&gt;
where
    T: Fn(i32) -> i32,
{
    calculation: T,
    value: Option&lt;i32&gt;,
}

impl&lt;T&gt; Cacher&lt;T&gt;
where
    T: Fn(i32) -> i32,
{
    fn new(calculation: T) -> Cacher&lt;T&gt; {
        Cacher { calculation, value: None }
    }

    fn value(&amp;mut self, arg: i32) -> i32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.calculation)(arg);
                self.value = Some(v);
                v
            }
        }
    }
}

fn main() {
    let mut expensive = Cacher::new(|x| {
        println!("computing...");
        x * x
    });
    println!("{}", expensive.value(5)); // computing... 25
    println!("{}", expensive.value(5)); // 25 (cached, no recompute)
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Common Mistakes</div>

  <p><strong>Mistake 1: Calling a moved closure twice</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: s is moved out of the closure on the first call
fn broken() {
    let s = String::from("hello");
    let consume = || drop(s); // moves s out
    consume();
    consume(); // error: use of moved value
}</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: clone s if you need to call multiple times
fn fixed() {
    let s = String::from("hello");
    let consume = || {
        let owned = s.clone();
        drop(owned);
    };
    consume();
    consume(); // now works
}</code></pre>
  </div>

  <p><strong>Mistake 2: Forgetting mut when the closure mutates</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken
let mut count = 0;
let increment = || count += 1; // closure must be mut
increment(); // error: cannot borrow as mutable</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: declare closure variable as mut
let mut count = 0;
let mut increment = || count += 1;
increment();
increment();</code></pre>
  </div>

  <p><strong>Mistake 3: Using a borrowed variable after it is captured by a move closure</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken
let text = String::from("hi");
let f = move || println!("{}", text);
println!("{}", text); // error: text was moved into f</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: clone before moving
let text = String::from("hi");
let text_clone = text.clone();
let f = move || println!("{}", text_clone);
println!("{}", text); // original still available</code></pre>
  </div>
</div>
`
  },

  'ch49': {
    moduleNum: 8,
    moduleTitle: 'Iterators, Closures & Functional Rust',
    chNum: 49,
    title: 'Iterators',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 8 &mdash; Chapter 49</span>
</div>
<h1>Iterators</h1>

<p>Imagine a conveyor belt in a factory. Items sit on the belt, and you pull one item at a time whenever you are ready. You do not need to know how many items there are in advance, and the belt does no work until you reach out and grab the next item. Rust iterators work exactly like that conveyor belt: they produce values one at a time, on demand, and do no work until asked.</p>

<h2>The Iterator Trait</h2>

<p>Every iterator in Rust implements the <code>Iterator</code> trait from the standard library. At its core, the trait requires just one method:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">pub trait Iterator {
    type Item;
    fn next(&amp;mut self) -> Option&lt;Self::Item&gt;;
    // many other methods have default implementations...
}</code></pre>
</div>

<p><code>next()</code> returns <code>Some(value)</code> while there are items left, and <code>None</code> when the iterator is exhausted. All other iterator methods (map, filter, collect, etc.) are built on top of this single method.</p>

<h2>Creating Iterators from Collections</h2>

<p>There are three ways to get an iterator from a collection, and each yields different types of values:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1, 2, 3];

    // iter() borrows each element: yields &i32
    for x in v.iter() {
        println!("{}", x); // x is &i32
    }

    // into_iter() consumes the collection: yields i32
    // v is no longer usable after this
    for x in v.into_iter() {
        println!("{}", x); // x is i32
    }

    let mut v2 = vec![1, 2, 3];

    // iter_mut() borrows mutably: yields &mut i32
    for x in v2.iter_mut() {
        *x *= 2; // double each element in place
    }
    println!("{:?}", v2); // [2, 4, 6]
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>A <code>for</code> loop automatically calls <code>into_iter()</code> on the value you hand it. Writing <code>for x in v</code> is equivalent to writing <code>for x in v.into_iter()</code>.</p>
</div>

<h2>Calling next() Manually</h2>

<p>You can call <code>next()</code> yourself to understand exactly how iterators work under the hood:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![10, 20, 30];
    let mut iter = v.iter(); // iter() returns an iterator

    println!("{:?}", iter.next()); // Some(10)
    println!("{:?}", iter.next()); // Some(20)
    println!("{:?}", iter.next()); // Some(30)
    println!("{:?}", iter.next()); // None
    println!("{:?}", iter.next()); // None (safe to call again)
}</code></pre>
</div>

<p>Notice that <code>next()</code> requires a <code>&amp;mut self</code> because calling it advances an internal cursor. That is why the iterator must be declared <code>mut</code>.</p>

<h2>Iterators Are Lazy</h2>

<p>This is one of the most important things to understand about Rust iterators. Creating an iterator does nothing by itself. The conveyor belt does not move until you pull an item.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // This does nothing yet. No computation happens here.
    let iter = v.iter().map(|x| {
        println!("processing {}", x);
        x * 2
    });

    println!("iterator created, nothing printed yet");

    // Only NOW does the work happen, as we consume the iterator
    let result: Vec&lt;i32&gt; = iter.collect();
    println!("{:?}", result);
}</code></pre>
</div>

<pre class="output"><code>iterator created, nothing printed yet
processing 1
processing 2
processing 3
processing 4
processing 5
[2, 4, 6, 8, 10]</code></pre>

<h2>Consuming Adaptors</h2>

<p>Methods that call <code>next()</code> internally and use up the iterator are called <strong>consuming adaptors</strong>. Once called, the iterator is gone.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1, 2, 3, 4, 5];

    let total: i32 = v.iter().sum();   // sum consumes the iterator
    println!("sum: {}", total);        // 15

    let count = v.iter().count();      // count consumes the iterator
    println!("count: {}", count);      // 5

    let max = v.iter().max();          // max consumes the iterator
    println!("max: {:?}", max);        // Some(5)

    let found = v.iter().any(|x| *x > 3); // any stops as soon as condition is met
    println!("any > 3: {}", found);    // true
}</code></pre>
</div>

<h2>Iterating Over Strings</h2>

<p>Strings have two useful iterators: one for characters and one for raw bytes:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let word = "hello";

    // Iterate over Unicode scalar values (chars)
    for c in word.chars() {
        print!("{} ", c); // h e l l o
    }
    println!();

    // Iterate over raw bytes
    for b in word.bytes() {
        print!("{} ", b); // 104 101 108 108 111
    }
    println!();

    // Count characters (correct for Unicode)
    println!("chars: {}", word.chars().count()); // 5
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Common Mistakes</div>

  <p><strong>Mistake 1: Forgetting that a for loop consumes the collection</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken
let v = vec![1, 2, 3];
for x in v { println!("{}", x); }
println!("{:?}", v); // error: v was moved into the for loop</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: iterate by reference
let v = vec![1, 2, 3];
for x in &amp;v { println!("{}", x); }
println!("{:?}", v); // v still usable</code></pre>
  </div>

  <p><strong>Mistake 2: Expecting an iterator adapter to do work immediately</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: map returns a lazy iterator, nothing happens
let v = vec![1, 2, 3];
v.iter().map(|x| x * 2); // warning: iterator never consumed</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: collect() triggers the computation
let v = vec![1, 2, 3];
let doubled: Vec&lt;i32&gt; = v.iter().map(|x| x * 2).collect();</code></pre>
  </div>

  <p><strong>Mistake 3: Forgetting to dereference when using iter()</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: iter() yields &i32, not i32
let v = vec![1, 2, 3];
let total: i32 = v.iter().sum::&lt;i32&gt;(); // this works, but:
let big: Vec&lt;i32&gt; = v.iter().filter(|x| x &gt; 2).collect(); // type mismatch</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: dereference in the closure
let v = vec![1, 2, 3];
let big: Vec&lt;&amp;i32&gt; = v.iter().filter(|x| **x &gt; 2).collect();
// or use copied() to get i32 values
let big: Vec&lt;i32&gt; = v.iter().copied().filter(|x| *x &gt; 2).collect();</code></pre>
  </div>
</div>
`
  },

  'ch50': {
    moduleNum: 8,
    moduleTitle: 'Iterators, Closures & Functional Rust',
    chNum: 50,
    title: 'map, filter, fold',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 8 &mdash; Chapter 50</span>
</div>
<h1>map, filter, fold</h1>

<p>Imagine sorting through a box of mixed fruit. First, you squeezes each fruit to check if it is ripe (filter). Then you peel the ripe ones (map). Finally, you count them all up (fold/reduce). This three-step pattern, filter then transform then combine, is at the heart of functional programming, and Rust's iterator adapters make it elegant and efficient.</p>

<h2>map: Transform Every Element</h2>

<p><code>map</code> takes a closure and applies it to each element, producing a new iterator of transformed values. Think of it as "for each item, give me a new item."</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Double each number
    let doubled: Vec&lt;i32&gt; = numbers.iter()
        .map(|x| x * 2)
        .collect();
    println!("{:?}", doubled); // [2, 4, 6, 8, 10]

    // Convert numbers to strings
    let as_strings: Vec&lt;String&gt; = numbers.iter()
        .map(|x| x.to_string())
        .collect();
    println!("{:?}", as_strings); // ["1", "2", "3", "4", "5"]

    // Transform a Vec of structs
    let names = vec!["alice", "bob", "carol"];
    let uppercased: Vec&lt;String&gt; = names.iter()
        .map(|name| name.to_uppercase())
        .collect();
    println!("{:?}", uppercased); // ["ALICE", "BOB", "CAROL"]
}</code></pre>
</div>

<h2>filter: Keep Only Matching Elements</h2>

<p><code>filter</code> takes a predicate (a closure that returns <code>bool</code>) and keeps only the elements for which the predicate returns <code>true</code>. The closure receives a reference to a reference, so you often need to dereference.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Keep only even numbers
    let evens: Vec&lt;&amp;i32&gt; = numbers.iter()
        .filter(|x| *x % 2 == 0)
        .collect();
    println!("{:?}", evens); // [2, 4, 6, 8, 10]

    // Using copied() to get i32 instead of &i32
    let odds: Vec&lt;i32&gt; = numbers.iter()
        .copied()
        .filter(|x| x % 2 != 0)
        .collect();
    println!("{:?}", odds); // [1, 3, 5, 7, 9]

    // Filter strings by length
    let words = vec!["hi", "hello", "hey", "howdy"];
    let long_words: Vec&lt;&amp;&amp;str&gt; = words.iter()
        .filter(|w| w.len() &gt; 3)
        .collect();
    println!("{:?}", long_words); // ["hello", "howdy"]
}</code></pre>
</div>

<h2>Chaining map and filter</h2>

<p>The real power comes from chaining these adapters. Each returns a new iterator, so you can stack them in a pipeline. The entire chain is still lazy and evaluated in one pass.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Keep evens, then double them
    let result: Vec&lt;i32&gt; = numbers.iter()
        .copied()
        .filter(|x| x % 2 == 0)
        .map(|x| x * 2)
        .collect();
    println!("{:?}", result); // [4, 8, 12, 16, 20]

    // Parse strings and filter valid numbers
    let inputs = vec!["1", "two", "3", "four", "5"];
    let parsed: Vec&lt;i32&gt; = inputs.iter()
        .filter_map(|s| s.parse::&lt;i32&gt;().ok())
        .collect();
    println!("{:?}", parsed); // [1, 3, 5]
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>filter_map</code> is a convenient combination: it maps each element and discards the <code>None</code> results. It is perfect for operations that might fail (like parsing).</p>
</div>

<h2>fold: Combine Everything Into One Value</h2>

<p><code>fold</code> is the most general way to reduce an iterator to a single result. You provide a starting value (the accumulator) and a closure that combines the accumulator with each element.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Sum using fold (accumulator starts at 0)
    let sum = numbers.iter().fold(0, |acc, x| acc + x);
    println!("sum: {}", sum); // 15

    // Product using fold (accumulator starts at 1)
    let product = numbers.iter().fold(1, |acc, x| acc * x);
    println!("product: {}", product); // 120

    // Build a string from a list of words
    let words = vec!["The", "quick", "brown", "fox"];
    let sentence = words.iter().fold(String::new(), |mut acc, word| {
        if !acc.is_empty() { acc.push(' '); }
        acc.push_str(word);
        acc
    });
    println!("{}", sentence); // The quick brown fox

    // Count occurrences manually
    let letters = vec!['a', 'b', 'a', 'c', 'a', 'b'];
    let a_count = letters.iter().fold(0, |acc, c| {
        if *c == 'a' { acc + 1 } else { acc }
    });
    println!("'a' appears {} times", a_count); // 3
}</code></pre>
</div>

<h2>Other Useful Adaptors and Consumers</h2>

<p>Rust provides many more iterator methods built on the same lazy pipeline idea:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![3, 1, 4, 1, 5, 9, 2, 6];

    // take and skip
    let first_three: Vec&lt;&amp;i32&gt; = v.iter().take(3).collect();
    println!("{:?}", first_three); // [3, 1, 4]

    let skip_two: Vec&lt;&amp;i32&gt; = v.iter().skip(2).collect();
    println!("{:?}", skip_two); // [4, 1, 5, 9, 2, 6]

    // enumerate: pairs each element with its index
    for (i, val) in v.iter().enumerate().take(3) {
        println!("v[{}] = {}", i, val);
    }

    // zip: pairs elements from two iterators
    let a = vec![1, 2, 3];
    let b = vec!["one", "two", "three"];
    let paired: Vec&lt;(i32, &amp;&amp;str)&gt; = a.iter().copied().zip(b.iter()).collect();
    println!("{:?}", paired); // [(1, "one"), (2, "two"), (3, "three")]

    // flatten: flattens nested iterators
    let nested = vec![vec![1, 2], vec![3, 4], vec![5]];
    let flat: Vec&lt;&amp;i32&gt; = nested.iter().flatten().collect();
    println!("{:?}", flat); // [1, 2, 3, 4, 5]
}</code></pre>
</div>

<h2>A Complete Pipeline Example</h2>

<p>Here is a realistic example that chains multiple adapters together:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let scores = vec![
        ("Alice", 85),
        ("Bob", 42),
        ("Carol", 91),
        ("Dave", 55),
        ("Eve", 78),
    ];

    // Find the average score of students who passed (score >= 60)
    let passing: Vec&lt;i32&gt; = scores.iter()
        .filter(|(_, score)| *score &gt;= 60)
        .map(|(_, score)| *score)
        .collect();

    let total: i32 = passing.iter().sum();
    let avg = total / passing.len() as i32;

    println!("Passing scores: {:?}", passing); // [85, 91, 78]
    println!("Average: {}", avg);              // 84
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Common Mistakes</div>

  <p><strong>Mistake 1: Using map instead of for_each when you only want side effects</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: map is lazy, this does nothing
let v = vec![1, 2, 3];
v.iter().map(|x| println!("{}", x)); // warning: iterator never consumed</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: use for_each for side effects
let v = vec![1, 2, 3];
v.iter().for_each(|x| println!("{}", x));
// or just use a for loop</code></pre>
  </div>

  <p><strong>Mistake 2: Misunderstanding the accumulator in fold</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: starting at 0 for a product gives 0 always
let v = vec![1, 2, 3, 4, 5];
let product = v.iter().fold(0, |acc, x| acc * x); // always 0!</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: identity element for multiplication is 1
let v = vec![1, 2, 3, 4, 5];
let product = v.iter().fold(1, |acc, x| acc * x); // 120</code></pre>
  </div>

  <p><strong>Mistake 3: Extra dereferences with iter() and filter</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Confusing: filter on iter() receives &&i32
let v = vec![1, 2, 3];
let r: Vec&lt;_&gt; = v.iter().filter(|x| **x &gt; 1).collect(); // works but awkward</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Cleaner: use copied() first to get i32 values
let v = vec![1, 2, 3];
let r: Vec&lt;i32&gt; = v.iter().copied().filter(|x| *x &gt; 1).collect();</code></pre>
  </div>
</div>
`
  },

  'ch51': {
    moduleNum: 8,
    moduleTitle: 'Iterators, Closures & Functional Rust',
    chNum: 51,
    title: 'Lazy Evaluation',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 8 &mdash; Chapter 51</span>
</div>
<h1>Lazy Evaluation</h1>

<p>Imagine ordering food at a restaurant. When you read the menu and decide what you want, the kitchen does not start cooking. The work only begins when you actually place the order. Rust iterators work the same way: building a chain of operations (map, filter, take) is like reading the menu. The actual computation only happens when you "place the order" by consuming the iterator with a method like <code>collect()</code>, <code>sum()</code>, or <code>for_each()</code>.</p>

<h2>What Lazy Evaluation Means</h2>

<p>In Rust, iterator adapter methods like <code>map</code>, <code>filter</code>, <code>take</code>, and <code>skip</code> do not process any elements when called. They return a new iterator struct that encodes the operation to be performed. Work only happens when a consuming method calls <code>next()</code> repeatedly.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // Building the chain does NO work
    let chain = v.iter()
        .map(|x| { println!("mapping {}", x); x * 2 })
        .filter(|x| { println!("filtering {}", x); x &gt; &amp;4 });

    println!("chain built, nothing happened yet");

    // collect() triggers all the work
    let result: Vec&lt;&amp;i32&gt; = chain.collect();
    println!("done: {:?}", result);
}</code></pre>
</div>

<pre class="output"><code>chain built, nothing happened yet
mapping 1
filtering 2
mapping 2
filtering 4
mapping 3
filtering 6
mapping 4
filtering 8
mapping 5
filtering 10
done: [6, 8, 10]</code></pre>

<p>Notice that each element goes through the entire chain before the next element is even started. This is called element-by-element processing, and it is what makes lazy evaluation efficient.</p>

<h2>The Power of Lazy Evaluation: Infinite Iterators</h2>

<p>Because no work happens until elements are consumed, you can create iterators over infinite sequences. This would be impossible with eager evaluation (which would try to compute everything upfront and run forever).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    // An iterator from 0 upward, forever
    let first_five: Vec&lt;i32&gt; = (0..).take(5).collect();
    println!("{:?}", first_five); // [0, 1, 2, 3, 4]

    // First 5 even squares
    let even_squares: Vec&lt;i32&gt; = (1..)
        .map(|x| x * x)
        .filter(|x| x % 2 == 0)
        .take(5)
        .collect();
    println!("{:?}", even_squares); // [4, 16, 36, 64, 100]

    // First number greater than 100 in an infinite sequence
    let found = (1..)
        .map(|x| x * x * x) // cubes
        .find(|x| *x &gt; 100);
    println!("{:?}", found); // Some(125)
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p><code>(0..)</code> is a range with no upper bound. It is a valid Rust expression and produces an infinite iterator. It is safe because Rust will never attempt to compute all values upfront.</p>
</div>

<h2>Standard Library Infinite Iterators</h2>

<p>The standard library provides several functions that create infinite iterators:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::iter;

fn main() {
    // repeat: yields the same value forever
    let fives: Vec&lt;i32&gt; = iter::repeat(5).take(4).collect();
    println!("{:?}", fives); // [5, 5, 5, 5]

    // repeat_with: calls a closure each time
    let mut n = 0;
    let counting: Vec&lt;i32&gt; = iter::repeat_with(|| { n += 1; n })
        .take(5)
        .collect();
    println!("{:?}", counting); // [1, 2, 3, 4, 5]

    // successors: each value is computed from the previous
    // Fibonacci sequence:
    let fibs: Vec&lt;u64&gt; = iter::successors(Some((0u64, 1u64)), |&amp;(a, b)| Some((b, a + b)))
        .map(|(a, _)| a)
        .take(8)
        .collect();
    println!("{:?}", fibs); // [0, 1, 1, 2, 3, 5, 8, 13]
}</code></pre>
</div>

<h2>Short-Circuit Evaluation</h2>

<p>Some consuming methods stop early once they have what they need. This is another benefit of lazy evaluation: you never do more work than necessary.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let v = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // any() stops as soon as it finds a match
    let has_even = v.iter().any(|x| {
        println!("checking {}", x);
        x % 2 == 0
    });
    println!("has even: {}", has_even);
    // Only checks 1 and 2, then stops

    // find() stops at the first match
    let first_gt5 = v.iter().find(|x| **x &gt; 5);
    println!("first &gt; 5: {:?}", first_gt5); // Some(6)

    // take_while() stops as soon as the predicate is false
    let prefix: Vec&lt;&amp;i32&gt; = v.iter().take_while(|x| **x &lt; 5).collect();
    println!("{:?}", prefix); // [1, 2, 3, 4]
}</code></pre>
</div>

<h2>Lazy Evaluation and Performance</h2>

<p>Because iterator chains are processed element-by-element in a single pass, they are often faster than equivalent code using intermediate collections. The compiler can also optimize iterator chains very aggressively, often producing code that is as fast as hand-written loops.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Approach 1: two separate passes, creates a temporary Vec
    let temp: Vec&lt;i32&gt; = data.iter().copied().filter(|x| x % 2 == 0).collect();
    let result1: i32 = temp.iter().map(|x| x * x).sum();

    // Approach 2: one lazy chain, no temporary allocation
    let result2: i32 = data.iter()
        .copied()
        .filter(|x| x % 2 == 0)
        .map(|x| x * x)
        .sum();

    println!("{} == {}", result1, result2); // 220 == 220
    // Approach 2 is more memory-efficient: no intermediate Vec created
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Common Mistakes</div>

  <p><strong>Mistake 1: Assuming an adapter chain runs immediately</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: side effect in map never runs, iterator never consumed
let v = vec![1, 2, 3];
v.iter().map(|x| println!("{}", x)); // compiler warning: unused</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: consume the iterator
let v = vec![1, 2, 3];
v.iter().for_each(|x| println!("{}", x));</code></pre>
  </div>

  <p><strong>Mistake 2: Trying to use an infinite iterator without take()</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: this runs forever (infinite loop)
let _all: Vec&lt;i32&gt; = (0..).collect(); // hangs</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: bound the infinite iterator
let first_ten: Vec&lt;i32&gt; = (0..).take(10).collect();</code></pre>
  </div>

  <p><strong>Mistake 3: Reusing an iterator after it has been consumed</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: iterator is exhausted after first collect
let mut iter = vec![1, 2, 3].into_iter();
let first: Vec&lt;i32&gt; = iter.by_ref().take(2).collect();
let rest: Vec&lt;i32&gt; = iter.collect(); // only [3] remains
// this is actually fine but easy to confuse</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Clear approach: use one chain
let v = vec![1, 2, 3];
let (first, rest): (Vec&lt;i32&gt;, Vec&lt;i32&gt;) = v.iter().copied().partition(|x| *x &lt; 3);
println!("{:?} {:?}", first, rest); // [1, 2] [3]</code></pre>
  </div>
</div>
`
  },

  'ch52': {
    moduleNum: 8,
    moduleTitle: 'Iterators, Closures & Functional Rust',
    chNum: 52,
    title: 'Higher-Order Functions',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 8 &mdash; Chapter 52</span>
</div>
<h1>Higher-Order Functions</h1>

<p>A manager at a company does not do every task themselves. Instead, they delegate: they hand a task description to an employee and trust them to carry it out. In programming, a higher-order function is a function that works the same way: it accepts another function (or closure) as an argument, or it returns a function as its result. You have already been using higher-order functions all along: <code>map</code>, <code>filter</code>, and <code>fold</code> are all higher-order functions.</p>

<h2>Functions as Parameters</h2>

<p>In Rust, you can pass a closure or a function pointer to another function using trait bounds (<code>Fn</code>, <code>FnMut</code>, <code>FnOnce</code>) or the <code>fn</code> pointer type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Accept any closure that takes i32 and returns i32
fn apply(value: i32, operation: impl Fn(i32) -> i32) -> i32 {
    operation(value)
}

fn double(x: i32) -> i32 { x * 2 }
fn square(x: i32) -> i32 { x * x }

fn main() {
    println!("{}", apply(5, double));        // 10
    println!("{}", apply(5, square));        // 25
    println!("{}", apply(5, |x| x + 100));  // 105

    // Apply a list of operations
    let ops: Vec&lt;fn(i32) -> i32&gt; = vec![double, square];
    for op in &amp;ops {
        println!("{}", op(4)); // 8, then 16
    }
}</code></pre>
</div>

<h2>Function Pointers vs Closures</h2>

<p>Rust has two ways to pass functions around:</p>

<dl>
  <dt>Function pointers (<code>fn</code>)</dt>
  <dd>Point to named functions defined with <code>fn</code>. They have a fixed size (one machine word) and implement all three <code>Fn</code> traits, but they cannot capture environment variables.</dd>
  <dt>Closures (<code>impl Fn / dyn Fn</code>)</dt>
  <dd>Can capture variables from their environment. Have a compiler-generated type that implements Fn traits.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn add_one(x: i32) -> i32 { x + 1 }

fn apply_fn(x: i32, f: fn(i32) -> i32) -> i32 {
    f(x)
}

fn apply_closure&lt;F: Fn(i32) -> i32&gt;(x: i32, f: F) -> i32 {
    f(x)
}

fn main() {
    // Both work with named functions
    println!("{}", apply_fn(5, add_one));      // 6
    println!("{}", apply_closure(5, add_one)); // 6

    let offset = 10;

    // Only the closure version can use a closure that captures
    // apply_fn(5, |x| x + offset); // error: fn ptr can't capture
    println!("{}", apply_closure(5, |x| x + offset)); // 15
}</code></pre>
</div>

<h2>Writing Your Own Higher-Order Functions</h2>

<p>You can write functions that accept closures to make reusable logic flexible:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn transform_all(data: &amp;[i32], f: impl Fn(i32) -> i32) -> Vec&lt;i32&gt; {
    data.iter().copied().map(f).collect()
}

fn keep_if(data: &amp;[i32], predicate: impl Fn(i32) -> bool) -> Vec&lt;i32&gt; {
    data.iter().copied().filter(predicate).collect()
}

fn reduce(data: &amp;[i32], init: i32, f: impl Fn(i32, i32) -> i32) -> i32 {
    data.iter().copied().fold(init, f)
}

fn main() {
    let nums = vec![1, 2, 3, 4, 5];

    let doubled  = transform_all(&amp;nums, |x| x * 2);
    let evens    = keep_if(&amp;nums, |x| x % 2 == 0);
    let total    = reduce(&amp;nums, 0, |acc, x| acc + x);

    println!("{:?}", doubled); // [2, 4, 6, 8, 10]
    println!("{:?}", evens);   // [2, 4]
    println!("{}", total);     // 15
}</code></pre>
</div>

<h2>Returning Functions (Returning Closures)</h2>

<p>A function can return a closure. Because closures have anonymous types, you must return them as <code>impl Fn(...)</code> or <code>Box&lt;dyn Fn(...)&gt;</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Return a closure using impl Fn (simplest, works when the return type is concrete)
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}

// Return a closure using Box&lt;dyn Fn&gt; (needed when returning different closure types)
fn make_multiplier(n: i32) -> Box&lt;dyn Fn(i32) -> i32&gt; {
    Box::new(move |x| x * n)
}

fn main() {
    let add5 = make_adder(5);
    let add10 = make_adder(10);

    println!("{}", add5(3));   // 8
    println!("{}", add10(3));  // 13

    let triple = make_multiplier(3);
    println!("{}", triple(7)); // 21
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Use <code>move</code> when returning a closure that captures local variables. Without <code>move</code>, the captured variable would be a reference, but it would not live long enough (the function returns and the local variable is dropped).</p>
</div>

<h2>Composing Functions</h2>

<p>You can build more complex behavior by composing simpler functions together:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn compose&lt;A, B, C&gt;(f: impl Fn(A) -> B, g: impl Fn(B) -> C) -> impl Fn(A) -> C {
    move |x| g(f(x))
}

fn main() {
    let double = |x: i32| x * 2;
    let add_one = |x: i32| x + 1;

    let double_then_add = compose(double, add_one);
    let add_then_double = compose(add_one, double);

    println!("{}", double_then_add(5)); // (5*2)+1 = 11
    println!("{}", add_then_double(5)); // (5+1)*2 = 12
}</code></pre>
</div>

<h2>Using map and sort with Function Pointers</h2>

<p>When a closure does not capture anything, you can use a named function wherever a closure is expected. This is often cleaner for simple transformations:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn is_odd(x: &amp;i32) -> bool { x % 2 != 0 }
fn to_string_rep(x: &amp;i32) -> String { format!("#{}", x) }

fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];

    // Using named functions instead of closures
    let odds: Vec&lt;&amp;i32&gt; = numbers.iter().filter(is_odd).collect();
    let labels: Vec&lt;String&gt; = numbers.iter().map(to_string_rep).collect();

    println!("{:?}", odds);   // [1, 3, 5]
    println!("{:?}", labels); // ["#1", "#2", "#3", "#4", "#5", "#6"]

    // Sorting with a key function
    let mut words = vec!["banana", "apple", "cherry", "date"];
    words.sort_by_key(|w| w.len());
    println!("{:?}", words); // ["date", "apple", "banana", "cherry"]
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Common Mistakes</div>

  <p><strong>Mistake 1: Returning a closure that borrows a local variable</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: n is a local variable, the closure borrows it, but n won't live long enough
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    |x| x + n // error: n may not live long enough
}</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: move n into the closure so the closure owns it
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}</code></pre>
  </div>

  <p><strong>Mistake 2: Using fn pointer type where a capturing closure is needed</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: fn cannot capture environment
let threshold = 5;
let check: fn(i32) -> bool = |x| x &gt; threshold; // error</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: use impl Fn or a closure variable
let threshold = 5;
let check = |x: i32| x &gt; threshold; // closure captures threshold
println!("{}", check(7)); // true</code></pre>
  </div>

  <p><strong>Mistake 3: Forgetting to use move when returning a closure from a function</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: closure borrows multiplier but does not own it
fn make_multiplier(multiplier: i32) -> Box&lt;dyn Fn(i32) -> i32&gt; {
    Box::new(|x| x * multiplier) // error: closure may outlive function
}</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: move captures multiplier by value
fn make_multiplier(multiplier: i32) -> Box&lt;dyn Fn(i32) -> i32&gt; {
    Box::new(move |x| x * multiplier)
}</code></pre>
  </div>
</div>
`
  },

  'ch53': {
    moduleNum: 8,
    moduleTitle: 'Iterators, Closures & Functional Rust',
    chNum: 53,
    title: 'Writing Iterator Adapters',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 8 &mdash; Chapter 53</span>
</div>
<h1>Writing Iterator Adapters</h1>

<p>The standard library gives you map, filter, and dozens of other adapters. But sometimes you need behavior that is unique to your problem. Think of building a custom tool for a specific job: when the standard toolbox does not have exactly what you need, you make your own tool that fits perfectly. In Rust, writing a custom iterator adapter means creating a struct that holds the state of the iteration and implementing the <code>Iterator</code> trait on it.</p>

<h2>Implementing the Iterator Trait from Scratch</h2>

<p>The minimum requirement is a struct to hold state and an <code>impl Iterator</code> block with <code>type Item</code> and <code>fn next</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Counter {
    count: u32,
    max: u32,
}

impl Counter {
    fn new(max: u32) -> Counter {
        Counter { count: 0, max }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&amp;mut self) -> Option&lt;Self::Item&gt; {
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

    // Use in a for loop
    for val in Counter::new(3) {
        print!("{} ", val); // 1 2 3
    }
    println!();

    // Use all iterator methods automatically
    let sum: u32 = Counter::new(5).sum();
    println!("sum: {}", sum); // 15

    let doubled: Vec&lt;u32&gt; = Counter::new(4).map(|x| x * 2).collect();
    println!("{:?}", doubled); // [2, 4, 6, 8]
}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Once you implement <code>next()</code>, every other iterator method (<code>map</code>, <code>filter</code>, <code>sum</code>, <code>collect</code>, etc.) works automatically because the standard library provides default implementations for all of them in the <code>Iterator</code> trait.</p>
</div>

<h2>Writing a Custom Iterator Adapter (Wrapping Another Iterator)</h2>

<p>An adapter is an iterator that wraps another iterator and modifies what it yields. This is how <code>map</code> and <code>filter</code> themselves are built internally. Let us write a <code>Stride</code> adapter that yields every Nth element:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Stride&lt;I: Iterator&gt; {
    inner: I,
    step: usize,
}

impl&lt;I: Iterator&gt; Stride&lt;I&gt; {
    fn new(inner: I, step: usize) -> Self {
        Stride { inner, step }
    }
}

impl&lt;I: Iterator&gt; Iterator for Stride&lt;I&gt; {
    type Item = I::Item;

    fn next(&amp;mut self) -> Option&lt;Self::Item&gt; {
        let item = self.inner.next()?; // get the first item
        // skip (step - 1) items
        for _ in 1..self.step {
            self.inner.next();
        }
        Some(item)
    }
}

fn main() {
    let v = vec![1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Every 3rd element starting from the first
    let strided: Vec&lt;i32&gt; = Stride::new(v.into_iter(), 3).collect();
    println!("{:?}", strided); // [1, 4, 7]
}</code></pre>
</div>

<h2>Adding a Convenience Method with a Trait</h2>

<p>The standard library adds <code>map</code>, <code>filter</code>, etc. as methods on all iterators by implementing them in the <code>Iterator</code> trait itself. You can do the same for your adapter by creating an extension trait:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Stride&lt;I: Iterator&gt; {
    inner: I,
    step: usize,
}

impl&lt;I: Iterator&gt; Iterator for Stride&lt;I&gt; {
    type Item = I::Item;

    fn next(&amp;mut self) -> Option&lt;Self::Item&gt; {
        let item = self.inner.next()?;
        for _ in 1..self.step {
            self.inner.next();
        }
        Some(item)
    }
}

// Extension trait: adds .stride(n) to any iterator
trait StrideExt: Iterator + Sized {
    fn stride(self, step: usize) -> Stride&lt;Self&gt; {
        Stride { inner: self, step }
    }
}

// Blanket implementation: all iterators get .stride()
impl&lt;I: Iterator&gt; StrideExt for I {}

fn main() {
    let result: Vec&lt;i32&gt; = (1..=9).stride(2).collect();
    println!("{:?}", result); // [1, 3, 5, 7, 9]
}</code></pre>
</div>

<h2>A Stateful Iterator: Running Total</h2>

<p>Some iterators need to maintain state across calls to <code>next()</code>. Here is a <code>RunningSum</code> adapter that yields the cumulative sum of an iterator:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct RunningSum&lt;I: Iterator&lt;Item = i32&gt;&gt; {
    inner: I,
    accumulated: i32,
}

impl&lt;I: Iterator&lt;Item = i32&gt;&gt; RunningSum&lt;I&gt; {
    fn new(inner: I) -> Self {
        RunningSum { inner, accumulated: 0 }
    }
}

impl&lt;I: Iterator&lt;Item = i32&gt;&gt; Iterator for RunningSum&lt;I&gt; {
    type Item = i32;

    fn next(&amp;mut self) -> Option&lt;i32&gt; {
        let val = self.inner.next()?;
        self.accumulated += val;
        Some(self.accumulated)
    }
}

fn main() {
    let data = vec![1, 2, 3, 4, 5];
    let cumulative: Vec&lt;i32&gt; = RunningSum::new(data.into_iter()).collect();
    println!("{:?}", cumulative); // [1, 3, 6, 10, 15]
}</code></pre>
</div>

<h2>Using scan() for Stateful Adapters Without Custom Structs</h2>

<p>For simpler cases, the built-in <code>scan()</code> adapter does the same job as a stateful iterator without requiring a new struct:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let data = vec![1, 2, 3, 4, 5];

    // scan(initial_state, closure(state, item) -> Option<output>)
    let running_sum: Vec&lt;i32&gt; = data.iter()
        .scan(0i32, |acc, &amp;x| {
            *acc += x;
            Some(*acc)
        })
        .collect();
    println!("{:?}", running_sum); // [1, 3, 6, 10, 15]

    // Running maximum
    let running_max: Vec&lt;i32&gt; = data.iter()
        .scan(i32::MIN, |max, &amp;x| {
            if x &gt; *max { *max = x; }
            Some(*max)
        })
        .collect();
    println!("{:?}", running_max); // [1, 2, 3, 4, 5]
}</code></pre>
</div>

<h2>Implementing size_hint for Better Performance</h2>

<p>Many iterators provide a <code>size_hint()</code> method that tells consumers an estimate of how many elements remain. This allows <code>collect()</code> to pre-allocate the right amount of memory:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Counter {
    count: u32,
    max: u32,
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&amp;mut self) -> Option&lt;u32&gt; {
        if self.count &lt; self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }

    // Optional but helpful: (lower_bound, Option&lt;upper_bound&gt;)
    fn size_hint(&amp;self) -> (usize, Option&lt;usize&gt;) {
        let remaining = (self.max - self.count) as usize;
        (remaining, Some(remaining))
    }
}

impl Counter {
    fn new(max: u32) -> Counter { Counter { count: 0, max } }
}

fn main() {
    let mut c = Counter::new(5);
    println!("{:?}", c.size_hint()); // (5, Some(5))
    c.next();
    println!("{:?}", c.size_hint()); // (4, Some(4))
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<div class="callout">
  <div class="callout-label">Common Mistakes</div>

  <p><strong>Mistake 1: Forgetting to declare the inner iterator as mutable</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: calling next() on inner requires &mut self, so inner must be mut
struct MyIter&lt;I: Iterator&gt; { inner: I }
impl&lt;I: Iterator&gt; Iterator for MyIter&lt;I&gt; {
    type Item = I::Item;
    fn next(&amp;mut self) -> Option&lt;I::Item&gt; {
        self.inner.next() // error if inner is not accessed through &mut self
    }
}</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: &mut self already gives you mutable access to self.inner
// The struct field itself does not need mut; the method receiver does
impl&lt;I: Iterator&gt; Iterator for MyIter&lt;I&gt; {
    type Item = I::Item;
    fn next(&amp;mut self) -> Option&lt;I::Item&gt; {
        self.inner.next() // correct, &mut self gives mutable access
    }
}</code></pre>
  </div>

  <p><strong>Mistake 2: Not returning None consistently after exhaustion</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Broken: after returning None, subsequent calls should also return None
struct BadCounter { count: i32 }
impl Iterator for BadCounter {
    type Item = i32;
    fn next(&amp;mut self) -> Option&lt;i32&gt; {
        self.count += 1;
        if self.count == 3 { return None; }
        Some(self.count) // resumes after None! unpredictable behavior
    }
}</code></pre>
  </div>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Fixed: once None is returned, always return None
struct GoodCounter { count: u32, max: u32 }
impl Iterator for GoodCounter {
    type Item = u32;
    fn next(&amp;mut self) -> Option&lt;u32&gt; {
        if self.count &lt; self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None // always None once exhausted
        }
    }
}</code></pre>
  </div>

  <p><strong>Mistake 3: Using ? in next() without knowing it returns Option</strong></p>
  <div class="code-block-wrapper">
    <span class="code-lang-label">rust</span>
    <pre><code class="language-rust">// Correct and idiomatic: ? on Option inside a method returning Option
impl&lt;I: Iterator&lt;Item = i32&gt;&gt; Iterator for MyWrapper&lt;I&gt; {
    type Item = i32;
    fn next(&amp;mut self) -> Option&lt;i32&gt; {
        let val = self.inner.next()?; // ? returns None if inner is done
        Some(val * 2)
    }
}</code></pre>
  </div>
</div>
`
  }
});
