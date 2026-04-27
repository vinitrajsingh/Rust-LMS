Object.assign(CHAPTERS_CONTENT, {

  /* =========================================================
     ch95 — Zero-Cost Abstractions
  ========================================================= */
  'ch95': {
    moduleNum: 15,
    moduleTitle: 'Performance Engineering',
    chNum: 95,
    title: 'Zero-Cost Abstractions',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 15 &mdash; Chapter 95</span>
</div>
<h1>Zero-Cost Abstractions</h1>

<p>One of Rust's central design promises is what is called <strong>zero-cost abstractions</strong>. The phrase comes from Bjarne Stroustrup, the creator of C++, who summarized it as: "What you don't use, you don't pay for. And further: what you do use, you couldn't hand code any better."</p>

<p>In practice this means: when you write nice, expressive, high-level Rust code, the compiler often produces machine code that is just as fast as if you had written low-level loops and pointer arithmetic by hand. You get the safety and clarity of a high-level language without the runtime cost most languages charge for it.</p>

<h2>Analogy: Power Steering</h2>

<p>Modern cars have power steering. It feels effortless to turn the wheel, but it does not consume noticeable extra fuel when you drive in a straight line. The cost is paid only when you actually use it, and even then it is so well engineered that you would not do better by removing it. A zero-cost abstraction works the same way: a clean, easy-to-use interface that, at the bottom, compiles down to the same machine code as the manual version.</p>

<h2>Example 1: Iterators vs Manual Loops</h2>

<p>The classic demonstration: an iterator chain and a hand-written loop that compute the same thing should produce nearly identical assembly when compiled with optimizations enabled.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// High-level iterator version
fn sum_squares_iter(data: &amp;[i32]) -&gt; i32 {
    data.iter().map(|x| x * x).sum()
}

// Low-level manual version
fn sum_squares_loop(data: &amp;[i32]) -&gt; i32 {
    let mut total = 0;
    for i in 0..data.len() {
        total += data[i] * data[i];
    }
    total
}

fn main() {
    let nums = [1, 2, 3, 4, 5];
    println!("{}", sum_squares_iter(&amp;nums));  // 55
    println!("{}", sum_squares_loop(&amp;nums));  // 55
}</code></pre>
</div>

<p>When you compile this with <code>cargo build --release</code>, both functions produce essentially identical assembly. The iterator version is not slower despite looking much higher level. The compiler inlines <code>map</code>, fuses it with <code>sum</code>, and emits a tight loop with no function calls.</p>

<div class="callout">
  <div class="callout-label">Key Insight</div>
  <p>Iterators in Rust are lazy. <code>map</code> does not produce a new collection; it produces a new iterator that knows how to transform each element when asked. The work only happens when something like <code>sum</code>, <code>collect</code>, or <code>for</code> drives it. This laziness is what lets the compiler fuse all the steps into one pass.</p>
</div>

<h2>Example 2: Option Has No Overhead</h2>

<p>In many languages, "this value might be missing" is represented with <code>null</code>, which costs you safety. In others, you wrap it in a special object that costs an allocation. Rust uses <code>Option&lt;T&gt;</code>, and for many types it has zero memory overhead thanks to <em>niche optimization</em>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::size_of;

fn main() {
    println!("&amp;u32:           {} bytes", size_of::&lt;&amp;u32&gt;());
    println!("Option&lt;&amp;u32&gt;:   {} bytes", size_of::&lt;Option&lt;&amp;u32&gt;&gt;());
    println!("Box&lt;u32&gt;:       {} bytes", size_of::&lt;Box&lt;u32&gt;&gt;());
    println!("Option&lt;Box&lt;u32&gt;&gt;: {} bytes", size_of::&lt;Option&lt;Box&lt;u32&gt;&gt;&gt;());
}</code></pre>
</div>

<pre class="output"><code>&amp;u32:             8 bytes
Option&lt;&amp;u32&gt;:     8 bytes
Box&lt;u32&gt;:         8 bytes
Option&lt;Box&lt;u32&gt;&gt;: 8 bytes</code></pre>

<p>References and <code>Box</code> values are pointers, and pointers can never be zero in safe Rust. The compiler uses the value <code>0</code> to represent <code>None</code>, so wrapping a pointer in <code>Option</code> adds no extra memory. This is something a hand-written C version with a "null pointer means missing" convention does, but you get type safety on top.</p>

<h2>Example 3: Generics Through Monomorphization</h2>

<p>When you write a generic function or struct, Rust does not use runtime type information. Instead, it compiles a separate specialized version for every concrete type used. This is called <strong>monomorphization</strong>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn smaller&lt;T: PartialOrd&gt;(a: T, b: T) -&gt; T {
    if a &lt; b { a } else { b }
}

fn main() {
    let i = smaller(3, 7);             // generates a version for i32
    let f = smaller(2.5_f64, 1.2);      // generates a version for f64
    let s = smaller("apple", "banana"); // generates a version for &amp;str
    println!("{} {} {}", i, f, s);
}</code></pre>
</div>

<p>At runtime, each call goes to a directly compiled function specialized for that type. There is no virtual dispatch, no boxing, no boxing tax. The trade-off is binary size: each used instantiation creates more code. But execution speed is the same as if you had written three separate non-generic functions.</p>

<h2>Example 4: When Abstractions Are NOT Free</h2>

<p>Not every abstraction is zero-cost. Some carry real, unavoidable runtime costs that you should know about.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">trait Greet {
    fn greet(&amp;self);
}

struct Cat;
impl Greet for Cat {
    fn greet(&amp;self) { println!("Meow"); }
}

// Static dispatch (zero cost): one specialized version per T
fn say_hello_static&lt;T: Greet&gt;(g: &amp;T) {
    g.greet();
}

// Dynamic dispatch (runtime cost): goes through a vtable
fn say_hello_dyn(g: &amp;dyn Greet) {
    g.greet();
}

fn main() {
    let c = Cat;
    say_hello_static(&amp;c);  // direct call, can be inlined
    say_hello_dyn(&amp;c);     // indirect call through a function pointer
}</code></pre>
</div>

<p>Trait objects (<code>&amp;dyn Trait</code>, <code>Box&lt;dyn Trait&gt;</code>) require a vtable lookup at every method call. This is usually a tiny cost (one extra pointer dereference), but it prevents the compiler from inlining, which can cascade into much larger missed optimizations. Use generics when speed matters, dynamic dispatch when flexibility or binary size matters.</p>

<h2>Other Common Costs</h2>

<dl>
  <dt>Heap allocation</dt>
  <dd><code>Box</code>, <code>Vec</code>, <code>String</code>, and <code>HashMap</code> all allocate. Allocation itself is fast but not free, and frees memory locality.</dd>
  <dt>Bounds checks</dt>
  <dd><code>vec[i]</code> checks that <code>i</code> is in range. Most of the time the optimizer eliminates the check inside loops, but not always.</dd>
  <dt>Reference counting</dt>
  <dd><code>Rc</code> and <code>Arc</code> increment and decrement counters on clone and drop. <code>Arc</code> uses atomics, which are more expensive than regular increments.</dd>
  <dt>Closures that capture</dt>
  <dd>Closures that capture by reference are essentially free; closures that capture by value are a struct holding the captured values, which can grow.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Assuming "high level" means "slow"</h3>
<p>It is tempting to drop into raw indexing thinking it will be faster than iterators. Almost always, the iterator version is the same speed or faster, and clearer.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// LESS IDIOMATIC and not faster
fn double_all_v1(v: &amp;mut Vec&lt;i32&gt;) {
    for i in 0..v.len() {
        v[i] *= 2;
    }
}

// IDIOMATIC and just as fast
fn double_all_v2(v: &amp;mut Vec&lt;i32&gt;) {
    for x in v.iter_mut() {
        *x *= 2;
    }
}</code></pre>
</div>

<h3>Mistake 2: Benchmarking debug builds</h3>
<p>If you run <code>cargo run</code> without <code>--release</code>, optimizations are turned off and abstractions look slow because they really are slow under <code>opt-level = 0</code>. Always benchmark with <code>cargo run --release</code> or <code>cargo bench</code>.</p>

<h3>Mistake 3: Forgetting that "zero cost" means zero abstraction overhead, not zero work</h3>
<p>Iterators avoid the cost of being an iterator. They do not avoid the cost of the work they describe. <code>vec.iter().sum()</code> still has to touch every element. If your algorithm is O(n^2), making the loop a chain of methods will not change that.</p>

<h3>Mistake 4: Using <code>dyn Trait</code> where generics would do</h3>
<p>Picking <code>Box&lt;dyn Trait&gt;</code> for collections of mixed types is correct. Picking it for a function that only takes one type at a time gives away inlining for no reason.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// COSTLY: every call goes through a vtable
fn process(items: &amp;[Box&lt;dyn Greet&gt;]) {
    for it in items { it.greet(); }
}

// CHEAPER when all items are the same type T
fn process_static&lt;T: Greet&gt;(items: &amp;[T]) {
    for it in items { it.greet(); }
}</code></pre>
</div>
`
  },

  /* =========================================================
     ch96 — Memory Layout
  ========================================================= */
  'ch96': {
    moduleNum: 15,
    moduleTitle: 'Performance Engineering',
    chNum: 96,
    title: 'Memory Layout',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 15 &mdash; Chapter 96</span>
</div>
<h1>Memory Layout</h1>

<p>Performance does not just depend on what your code does; it depends on how your data is laid out in memory. Two structs that hold the same fields can take different amounts of space, and reordering them can sometimes shave off bytes for free. This chapter explains how Rust lays out structs, enums, and primitives, and how you can control the layout when you need to.</p>

<h2>Analogy: Packing a Suitcase</h2>

<p>If you throw a hairdryer, a shoe, and a pair of socks into a suitcase in the wrong order, you waste space and the lid will not close. If you pack the big rigid items first and tuck the soft items into the gaps, everything fits. Rust's compiler is allowed to "repack" your struct fields the same way to minimize wasted space, unless you explicitly tell it to keep your order.</p>

<h2>Size and Alignment</h2>

<p>Every type in Rust has two fundamental properties:</p>

<dl>
  <dt><code>size_of::&lt;T&gt;()</code></dt>
  <dd>How many bytes a value of <code>T</code> occupies in memory.</dd>
  <dt><code>align_of::&lt;T&gt;()</code></dt>
  <dd>The address alignment <code>T</code> requires. A value with alignment 4 can only live at memory addresses that are multiples of 4. CPUs read aligned data faster, and some instructions only work on aligned data.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::{size_of, align_of};

fn main() {
    println!("u8:   size = {}, align = {}", size_of::&lt;u8&gt;(),  align_of::&lt;u8&gt;());
    println!("u16:  size = {}, align = {}", size_of::&lt;u16&gt;(), align_of::&lt;u16&gt;());
    println!("u32:  size = {}, align = {}", size_of::&lt;u32&gt;(), align_of::&lt;u32&gt;());
    println!("u64:  size = {}, align = {}", size_of::&lt;u64&gt;(), align_of::&lt;u64&gt;());
}</code></pre>
</div>

<pre class="output"><code>u8:   size = 1, align = 1
u16:  size = 2, align = 2
u32:  size = 4, align = 4
u64:  size = 8, align = 8</code></pre>

<h2>Padding</h2>

<p>To respect alignment, the compiler may insert <em>padding bytes</em> between fields. Consider this struct:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::size_of;

#[repr(C)]
struct Bad {
    a: u8,    // 1 byte
    b: u32,   // 4 bytes, but needs 4-byte alignment
    c: u8,    // 1 byte
}

fn main() {
    println!("size of Bad = {}", size_of::&lt;Bad&gt;());
}</code></pre>
</div>

<pre class="output"><code>size of Bad = 12</code></pre>

<p>Why 12 and not 6? With <code>#[repr(C)]</code> the compiler keeps the field order you wrote, then inserts padding so each field is properly aligned and the whole struct's size is a multiple of its alignment:</p>

<pre class="output"><code>offset 0: a    (1 byte)
offset 1: pad  (3 bytes)   &lt;- align b to 4
offset 4: b    (4 bytes)
offset 8: c    (1 byte)
offset 9: pad  (3 bytes)   &lt;- pad struct size to multiple of 4
total: 12 bytes</code></pre>

<h2>Field Reordering Saves Space</h2>

<p>By default Rust uses <code>#[repr(Rust)]</code>, which lets the compiler reorder fields to minimize padding. Putting larger-aligned fields first usually helps:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::size_of;

struct Default {  // repr(Rust): compiler picks order
    a: u8,
    b: u32,
    c: u8,
}

#[repr(C)]
struct Reordered {  // we manually pick a good order
    b: u32,
    a: u8,
    c: u8,
}

fn main() {
    println!("Default:    {}", size_of::&lt;Default&gt;());
    println!("Reordered:  {}", size_of::&lt;Reordered&gt;());
}</code></pre>
</div>

<pre class="output"><code>Default:    8
Reordered:  8</code></pre>

<p>The default <code>#[repr(Rust)]</code> already shrinks the struct from 12 bytes to 8 by reordering the fields. The manual <code>#[repr(C)] Reordered</code> matches that by putting the 4-byte field first. Rule of thumb: when you control the layout, sort fields from largest-aligned to smallest-aligned.</p>

<h2>The repr Attributes</h2>

<dl>
  <dt><code>#[repr(Rust)]</code> (default)</dt>
  <dd>Compiler may reorder fields to minimize size. Layout is not stable across versions.</dd>
  <dt><code>#[repr(C)]</code></dt>
  <dd>Field order matches source code, alignment and padding follow the C ABI. Use this for FFI.</dd>
  <dt><code>#[repr(transparent)]</code></dt>
  <dd>For a struct with exactly one non-zero-sized field. The struct has the same layout and ABI as that field. Useful for newtypes that you want to be ABI-compatible with the underlying type.</dd>
  <dt><code>#[repr(packed)]</code></dt>
  <dd>No padding. Saves space but reads and writes may be slower or undefined on some platforms. Rarely needed; only use it for protocol parsing.</dd>
</dl>

<h2>Enum Layout and Niche Optimization</h2>

<p>An enum needs to store both a tag (which variant it is) and the variant's data. A simple <code>enum Direction { North, South, East, West }</code> with no payload only needs one byte. But enums with payloads need more:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::mem::size_of;

enum Color {
    Red,
    Green,
    Blue,
    Custom(u32),
}

fn main() {
    println!("Color: {} bytes", size_of::&lt;Color&gt;());
    println!("Option&lt;u32&gt;: {} bytes", size_of::&lt;Option&lt;u32&gt;&gt;());
    println!("Option&lt;&amp;u32&gt;: {} bytes", size_of::&lt;Option&lt;&amp;u32&gt;&gt;());
}</code></pre>
</div>

<pre class="output"><code>Color: 8 bytes
Option&lt;u32&gt;: 8 bytes
Option&lt;&amp;u32&gt;: 8 bytes</code></pre>

<p>Notice <code>Option&lt;&amp;u32&gt;</code> takes only 8 bytes, the same as <code>&amp;u32</code> alone. This is <strong>niche optimization</strong>: the compiler knows references can never be null (zero), so it uses the all-zero pattern as the <code>None</code> tag and avoids any extra discriminant byte. <code>Option&lt;u32&gt;</code> needs 8 bytes because <code>u32</code> can be any value, so a separate tag byte is needed (with padding for alignment).</p>

<h2>Stack vs Heap Layout</h2>

<p>Knowing where data lives matters for performance. The stack is fast (just a pointer bump), the heap involves a global allocator and pointer chasing.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let on_stack: [u8; 4] = [1, 2, 3, 4];        // 4 bytes on stack
    let on_heap: Vec&lt;u8&gt; = vec![1, 2, 3, 4];     // pointer/len/cap on stack, data on heap

    let big_box: Box&lt;[u8; 1024]&gt; = Box::new([0; 1024]); // 8-byte ptr on stack, 1024 bytes on heap

    println!("{} {} {}", on_stack[0], on_heap[0], big_box[0]);
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Relying on default Rust layout for FFI</h3>
<p>If you pass a struct to C without <code>#[repr(C)]</code>, fields may be in a different order than you wrote, and C will read garbage.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: fields may be reordered, breaks FFI
struct PointBad {
    x: f64,
    y: f64,
}

// FIXED: explicit C layout
#[repr(C)]
struct PointGood {
    x: f64,
    y: f64,
}</code></pre>
</div>

<h3>Mistake 2: Using <code>repr(packed)</code> casually</h3>
<p>Packed structs disable alignment and create unaligned references. Taking a reference to a field of a packed struct is undefined behavior.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[repr(packed)]
struct Packed { a: u8, b: u32 }

fn main() {
    let p = Packed { a: 1, b: 2 };
    // let r = &amp;p.b; // UB! reference to misaligned field
    let copied = p.b; // OK: copies by value
    println!("{}", copied);
}</code></pre>
</div>

<h3>Mistake 3: Worrying about layout before measuring</h3>
<p>Most programs do not have a memory-layout-bound bottleneck. Optimize layout when you have data that says it matters: cache misses, hot allocations, FFI failures.</p>

<h3>Mistake 4: Assuming small types are always cheaper</h3>
<p>A <code>u8</code> field followed by a <code>u32</code> wastes 3 bytes of padding under <code>#[repr(C)]</code>. Sometimes a <code>u16</code> or <code>u32</code> in place of a <code>u8</code> is the same size and easier to work with.</p>
`
  },

  /* =========================================================
     ch97 — Cache Locality
  ========================================================= */
  'ch97': {
    moduleNum: 15,
    moduleTitle: 'Performance Engineering',
    chNum: 97,
    title: 'Cache Locality',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 15 &mdash; Chapter 97</span>
</div>
<h1>Cache Locality</h1>

<p>The CPU is much faster than main memory. To hide that gap, modern processors have small, very fast memories called <strong>caches</strong> sitting between the CPU and RAM. The first time the CPU touches a piece of memory, it pays the full RAM cost. The next time, if it is still in cache, the access is dozens or hundreds of times faster. Code that uses memory in a way the cache likes is sometimes ten times faster than code that does not, even if both have the same theoretical complexity.</p>

<h2>Analogy: A Library Reading Desk</h2>

<p>Imagine a researcher in a library. Walking back to a shelf in another aisle for every quote takes minutes. Pulling a stack of related books to a reading desk and consulting them in order takes seconds per quote. The desk is the cache, the shelves are RAM, and the cost of an aisle walk is a "cache miss." Code that reads memory in sequence is like working from a stack of books on the desk; code that jumps around in memory is like running back and forth across the library all day.</p>

<h2>The Cache Hierarchy</h2>

<p>A typical desktop CPU has three levels of cache:</p>

<dl>
  <dt>L1 cache</dt>
  <dd>Tens of kilobytes per core. Access time around 1 nanosecond. The fastest level.</dd>
  <dt>L2 cache</dt>
  <dd>Hundreds of kilobytes per core. A few nanoseconds. Slower than L1 but still very fast.</dd>
  <dt>L3 cache</dt>
  <dd>Several megabytes shared between cores. Around 10-30 nanoseconds.</dd>
  <dt>Main memory (RAM)</dt>
  <dd>Gigabytes. 100+ nanoseconds. Compared to L1, this is glacial.</dd>
</dl>

<p>Memory is fetched into cache in fixed-size blocks called <strong>cache lines</strong>, typically 64 bytes on x86 and ARM. When you read one byte, the CPU pulls the whole 64-byte line. The next 63 bytes are then "free" until you cross a line boundary.</p>

<h2>Sequential Access Wins</h2>

<p>Consider summing a million integers. A flat <code>Vec&lt;i32&gt;</code> stores them in a contiguous block. Reading the first element pulls in 16 ints (64 bytes), so the next 15 reads are free. The CPU's prefetcher even predicts the pattern and pulls the next line ahead of time:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn sum_vec(v: &amp;Vec&lt;i32&gt;) -&gt; i64 {
    let mut total: i64 = 0;
    for &amp;x in v {
        total += x as i64;
    }
    total
}

fn main() {
    let v: Vec&lt;i32&gt; = (0..1_000_000).collect();
    println!("sum = {}", sum_vec(&amp;v));
}</code></pre>
</div>

<p>This loop is memory-bandwidth bound, but cache-friendly. On modern hardware it runs in a few milliseconds.</p>

<h2>Why LinkedList Is Slow</h2>

<p>A <code>LinkedList</code> stores each element in a separately-allocated node. Each <code>next</code> pointer can point anywhere in memory, so iterating means following pointers to addresses the CPU has to fetch one at a time. Each fetch is potentially a cache miss.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::collections::LinkedList;

fn sum_list(l: &amp;LinkedList&lt;i32&gt;) -&gt; i64 {
    let mut total: i64 = 0;
    for &amp;x in l {
        total += x as i64;
    }
    total
}

fn main() {
    let l: LinkedList&lt;i32&gt; = (0..1_000_000).collect();
    println!("sum = {}", sum_list(&amp;l));
}</code></pre>
</div>

<p>Big-O analysis says both <code>Vec</code> and <code>LinkedList</code> iteration are O(n). In wall-clock time, the <code>Vec</code> version is often 5 to 20 times faster on the same data. This is why the Rust standard library actively recommends preferring <code>Vec</code> and <code>VecDeque</code> over <code>LinkedList</code> in almost all situations.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The official documentation for <code>std::collections::LinkedList</code> literally says: "It is almost always better to use <code>Vec</code> or <code>VecDeque</code> because array-based containers are generally faster, more memory efficient, and make better use of CPU cache."</p>
</div>

<h2>Array of Structs vs Struct of Arrays</h2>

<p>When you have many records and only need a few fields per loop, the layout matters a lot.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Array of Structs (AoS): natural and easy to read
struct ParticleAoS {
    x: f32,
    y: f32,
    z: f32,
    mass: f32,
    color: [u8; 4],
}

fn average_x_aos(particles: &amp;[ParticleAoS]) -&gt; f32 {
    let mut sum = 0.0;
    for p in particles {
        sum += p.x;
    }
    sum / particles.len() as f32
}</code></pre>
</div>

<p>Each particle is 20 bytes. To average just <code>x</code>, the CPU still loads the whole 20 bytes per particle, wasting bandwidth on <code>y</code>, <code>z</code>, <code>mass</code>, and <code>color</code> that are never read.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Struct of Arrays (SoA): keep parallel arrays of each field
struct ParticlesSoA {
    x: Vec&lt;f32&gt;,
    y: Vec&lt;f32&gt;,
    z: Vec&lt;f32&gt;,
    mass: Vec&lt;f32&gt;,
    color: Vec&lt;[u8; 4]&gt;,
}

fn average_x_soa(p: &amp;ParticlesSoA) -&gt; f32 {
    let sum: f32 = p.x.iter().sum();
    sum / p.x.len() as f32
}</code></pre>
</div>

<p>Now the CPU only loads the <code>x</code> array, packing 16 floats per cache line. For workloads that touch one or two fields at a time, SoA can be several times faster. AoS is still a better fit when you usually use most fields together (for example, drawing a particle uses position and color in the same loop).</p>

<h2>Sequential vs Random Access</h2>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::time::Instant;

fn main() {
    let n = 10_000_000;
    let v: Vec&lt;i32&gt; = (0..n).collect();

    // Sequential
    let t0 = Instant::now();
    let mut s: i64 = 0;
    for i in 0..n as usize {
        s += v[i] as i64;
    }
    println!("sequential: {:?} sum = {}", t0.elapsed(), s);

    // "Random" (large strides defeat the prefetcher)
    let t0 = Instant::now();
    let mut s: i64 = 0;
    let stride = 4096; // 4 KB jumps
    for start in 0..stride {
        let mut i = start;
        while i &lt; n as usize {
            s += v[i] as i64;
            i += stride;
        }
    }
    println!("strided:    {:?} sum = {}", t0.elapsed(), s);
}</code></pre>
</div>

<p>Both versions touch every element exactly once, but the strided version forces the prefetcher to chase random-looking addresses and wastes most of each cache line. The strided version is typically 5-10 times slower.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Picking a data structure by its Big-O without measuring</h3>
<p><code>HashMap</code> is O(1) lookup. A <code>Vec</code> with linear search is O(n). For tiny collections (say, fewer than 32 items), the <code>Vec</code> often wins because everything fits in one cache line and there is no hashing overhead.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// For very small N, this is faster than HashMap
fn small_lookup(items: &amp;[(u32, &amp;str)], key: u32) -&gt; Option&lt;&amp;str&gt; {
    items.iter().find(|(k, _)| *k == key).map(|(_, v)| *v)
}</code></pre>
</div>

<h3>Mistake 2: Reaching for LinkedList because "lists are good at insertion"</h3>
<p>Insertion in the middle of a <code>Vec</code> is O(n) because of the shift, but the shift is one fast contiguous memcpy. Insertion in a <code>LinkedList</code> is O(1) at the node, but you still had to traverse to find the node, which was already slow because of cache misses. The <code>Vec</code> usually wins anyway.</p>

<h3>Mistake 3: Storing big structs in a Vec when only one field is hot</h3>
<p>If a tight inner loop only reads one field of a 100-byte struct, switch to SoA or pull the hot field into its own <code>Vec</code>.</p>

<h3>Mistake 4: Ignoring allocator effects</h3>
<p>Many small <code>Box</code>es scatter your data across the heap. Storing the same data in a <code>Vec</code> keeps it contiguous. When in doubt, prefer the contiguous layout.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// SCATTERED: each Box is a separate heap allocation
let boxed: Vec&lt;Box&lt;[u8; 64]&gt;&gt; = (0..1000).map(|_| Box::new([0u8; 64])).collect();

// CONTIGUOUS: one big allocation
let flat: Vec&lt;[u8; 64]&gt; = vec![[0u8; 64]; 1000];</code></pre>
</div>
`
  },

  /* =========================================================
     ch98 — Benchmarking
  ========================================================= */
  'ch98': {
    moduleNum: 15,
    moduleTitle: 'Performance Engineering',
    chNum: 98,
    title: 'Benchmarking',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 15 &mdash; Chapter 98</span>
</div>
<h1>Benchmarking</h1>

<p>Before you can make a program faster, you have to measure how fast it currently is. Benchmarking sounds simple ("just time it"), but doing it correctly is surprisingly tricky. Compilers can optimize away the very thing you are trying to measure, the operating system can interrupt your process, and a single run can be misleading. This chapter covers how to benchmark Rust code reliably.</p>

<h2>Analogy: Timing a Sprint</h2>

<p>If you want to know how fast a runner is, you do not eyeball them once on a windy day in muddy shoes. You take multiple runs, on a flat track, in good conditions, and average the results, throwing out warm-up laps. Benchmarking code is the same: a single timing on a debug build with the laptop on battery saver tells you almost nothing.</p>

<h2>The Most Basic Tool: Instant</h2>

<p>The standard library gives you <code>std::time::Instant</code>, which captures a high-precision timestamp.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::time::Instant;

fn fibonacci(n: u64) -&gt; u64 {
    if n &lt; 2 { n } else { fibonacci(n - 1) + fibonacci(n - 2) }
}

fn main() {
    let start = Instant::now();
    let result = fibonacci(35);
    let elapsed = start.elapsed();
    println!("fib(35) = {} in {:?}", result, elapsed);
}</code></pre>
</div>

<pre class="output"><code>fib(35) = 9227465 in 28.4ms</code></pre>

<p>Rules of thumb when using <code>Instant</code> directly:</p>

<ul>
  <li>Always build with <code>cargo run --release</code> or <code>cargo build --release</code>. Debug builds are 10-100 times slower and exercise different code paths.</li>
  <li>Repeat the work many times and divide. A single run is dominated by noise (OS scheduling, CPU frequency scaling, caches that are not yet warm).</li>
  <li>Run a few warm-up iterations first, then start measuring. This ensures caches and branch predictors are in their steady state.</li>
</ul>

<h2>The black_box Trick</h2>

<p>The optimizer is aggressive. If it can prove that a calculation has no observable effect, it deletes the calculation entirely. Your benchmark then measures nothing.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::time::Instant;

fn slow_sum(n: u64) -&gt; u64 {
    let mut s = 0u64;
    for i in 0..n { s = s.wrapping_add(i); }
    s
}

fn main() {
    let t = Instant::now();
    let _ = slow_sum(10_000_000); // result is unused
    println!("{:?}", t.elapsed()); // may print 0ns! the compiler deleted the loop
}</code></pre>
</div>

<p>The fix is <code>std::hint::black_box</code>. It is a function that does nothing visible, but the optimizer is forbidden from reasoning about its argument. Wrapping inputs and outputs in <code>black_box</code> defeats the dead-code optimizer.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::hint::black_box;
use std::time::Instant;

fn slow_sum(n: u64) -&gt; u64 {
    let mut s = 0u64;
    for i in 0..n { s = s.wrapping_add(i); }
    s
}

fn main() {
    let n = black_box(10_000_000); // hide the value from the optimizer
    let t = Instant::now();
    let result = slow_sum(n);
    let elapsed = t.elapsed();
    black_box(result); // pretend we use the result
    println!("{:?}", elapsed);
}</code></pre>
</div>

<h2>The criterion Crate</h2>

<p>For serious benchmarking, the de facto standard in the Rust ecosystem is the <code>criterion</code> crate. It handles warm-up, statistical analysis, outlier detection, regression detection, and pretty reports. <code>criterion</code> is mentioned in <em>The Rust Performance Book</em> and the <em>Rust by Example</em> documentation.</p>

<p>Add it to <code>Cargo.toml</code> as a dev-dependency:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[dev-dependencies]
criterion = "0.5"

[[bench]]
name = "my_bench"
harness = false</code></pre>
</div>

<p>Place benchmarks in <code>benches/my_bench.rs</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci(n: u64) -&gt; u64 {
    if n &lt; 2 { n } else { fibonacci(n - 1) + fibonacci(n - 2) }
}

fn bench_fib(c: &amp;mut Criterion) {
    c.bench_function("fib 20", |b| {
        b.iter(|| fibonacci(black_box(20)))
    });
}

criterion_group!(benches, bench_fib);
criterion_main!(benches);</code></pre>
</div>

<p>Run with <code>cargo bench</code>. Criterion will run many iterations, compute mean and confidence intervals, and store baseline measurements so future runs can warn you about regressions.</p>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Rust also has a built-in <code>#[bench]</code> attribute and <code>test::Bencher</code>, but they require nightly Rust. <code>criterion</code> works on stable and is what the ecosystem uses in practice.</p>
</div>

<h2>Comparing Two Implementations</h2>

<p>One of criterion's most useful features is <code>bench_with_input</code> for comparing alternatives over a range of input sizes:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};

fn sum_loop(v: &amp;[i32]) -&gt; i64 {
    let mut s = 0i64;
    for &amp;x in v { s += x as i64; }
    s
}

fn sum_iter(v: &amp;[i32]) -&gt; i64 {
    v.iter().map(|&amp;x| x as i64).sum()
}

fn compare(c: &amp;mut Criterion) {
    let mut group = c.benchmark_group("sum");
    for size in [100, 10_000, 1_000_000].iter() {
        let data: Vec&lt;i32&gt; = (0..*size).collect();
        group.bench_with_input(BenchmarkId::new("loop", size), size, |b, _| {
            b.iter(|| sum_loop(black_box(&amp;data)))
        });
        group.bench_with_input(BenchmarkId::new("iter", size), size, |b, _| {
            b.iter(|| sum_iter(black_box(&amp;data)))
        });
    }
    group.finish();
}

criterion_group!(benches, compare);
criterion_main!(benches);</code></pre>
</div>

<p>This produces a clean table showing whether the iterator version is faster, slower, or the same as the manual loop, at each input size.</p>

<h2>What Good Numbers Look Like</h2>

<p>A benchmark report from criterion looks like this:</p>

<pre class="output"><code>fib 20                  time:   [21.143 us 21.187 us 21.235 us]
                        change: [-0.42% +0.10% +0.65%] (p = 0.71 &gt; 0.05)
                        No change in performance detected.</code></pre>

<p>The three numbers are the lower bound, point estimate, and upper bound of a 95% confidence interval. The "change" line compares to a previous run if one exists. The p-value tells you whether the change is statistically significant.</p>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Benchmarking debug builds</h3>
<p><code>cargo run</code> uses <code>opt-level = 0</code> with debug assertions on. Numbers from a debug build do not predict release performance at all.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash"># WRONG: measures slow debug build
cargo run

# RIGHT: measures optimized release build
cargo run --release

# BEST: criterion runs in release by default
cargo bench</code></pre>
</div>

<h3>Mistake 2: Forgetting black_box</h3>
<p>When the optimizer can prove a value is unused, it deletes the entire computation. Your "benchmark" then measures the time to do nothing.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BUG: the optimizer may delete this whole loop
b.iter(|| { let _ = expensive_function(42); });

// FIX: hide the input and consume the output
b.iter(|| expensive_function(black_box(42)));</code></pre>
</div>

<h3>Mistake 3: Drawing conclusions from a single run</h3>
<p>Cache state, CPU frequency scaling, OS scheduling, and background processes all affect timing. Always run multiple iterations. Criterion does this automatically.</p>

<h3>Mistake 4: Benchmarking microscopic operations</h3>
<p>If your function takes 10 nanoseconds, the timing overhead itself can dominate. Either benchmark a batch of operations together or use criterion's <code>iter_batched</code>, which is designed for this case.</p>
`
  },

  /* =========================================================
     ch99 — Profiling (Flamegraph)
  ========================================================= */
  'ch99': {
    moduleNum: 15,
    moduleTitle: 'Performance Engineering',
    chNum: 99,
    title: 'Profiling (Flamegraph)',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 15 &mdash; Chapter 99</span>
</div>
<h1>Profiling (Flamegraph)</h1>

<p>Benchmarking tells you <em>that</em> your code is slow. Profiling tells you <em>where</em> it is slow. A profiler watches a running program and reports which functions consumed the most time. Once you know the hot functions, you know where to focus your optimization effort. This chapter focuses on <strong>flamegraphs</strong>, a popular visualization, and the tools that produce them.</p>

<h2>Analogy: A Heat Map of Your Day</h2>

<p>Imagine someone follows you around for an hour with a stopwatch and notes how much time you spend on every task: 20 minutes in meetings, 15 minutes on email, 10 minutes refilling coffee, and so on. At the end you get a chart sorted by time. You instantly see that "refilling coffee" is unexpectedly large and worth fixing. A profiler does the same thing for a program, sampling its call stack many times per second.</p>

<h2>Sampling vs Instrumentation</h2>

<dl>
  <dt>Sampling profiler</dt>
  <dd>Periodically (say, 1000 times per second) interrupts the program and records the current call stack. After many samples, the function that appears most often is probably the slowest. Low overhead, used by most production profilers including <code>perf</code> and the OS-level tools.</dd>
  <dt>Instrumenting profiler</dt>
  <dd>Inserts measurement code at every function entry and exit. Gives exact counts, but adds significant overhead and can change the program's behavior. Most Rust workflows prefer sampling.</dd>
</dl>

<h2>What Is a Flamegraph?</h2>

<p>A flamegraph is a stacked horizontal bar chart that visualizes call-stack samples. Each box is a function. The horizontal axis is the percentage of samples that contained that function (so wider = more time spent). The vertical axis is the call stack: a function and the functions it called are stacked on top of each other.</p>

<p>The shape gives you instant clues:</p>

<ul>
  <li>A wide flat plateau near the top = a single function eating all the time, ripe for optimization.</li>
  <li>A wide tall stack = lots of function-call overhead, possibly fixable with inlining or restructuring.</li>
  <li>Lots of narrow spikes = no single hot spot, the cost is spread out.</li>
</ul>

<h2>The cargo-flamegraph Tool</h2>

<p>The community crate <code>cargo-flamegraph</code> wraps the necessary system profilers and produces an SVG flamegraph for you. Install it with:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo install flamegraph</code></pre>
</div>

<p>It depends on a system profiler underneath:</p>

<ul>
  <li><strong>Linux:</strong> <code>perf</code> (install with your package manager, for example <code>apt install linux-perf</code>).</li>
  <li><strong>macOS:</strong> <code>dtrace</code> (already installed; may require running with <code>sudo</code> or disabling SIP).</li>
  <li><strong>Windows:</strong> Less mature; the official guidance is to use the WSL workflow or a profiler like Visual Studio's built-in tools.</li>
</ul>

<h2>Profiling a Program</h2>

<p>Suppose you have this CPU-bound program:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn slow_factor_count(n: u64) -&gt; u64 {
    let mut count = 0;
    for i in 1..=n {
        if n % i == 0 { count += 1; }
    }
    count
}

fn main() {
    let mut total = 0;
    for n in 1..200_000u64 {
        total += slow_factor_count(n);
    }
    println!("{}", total);
}</code></pre>
</div>

<p>To profile it, you need debug symbols even in the release build. In <code>Cargo.toml</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[profile.release]
debug = true   # keep symbols so the profiler can name functions</code></pre>
</div>

<p>Then run:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">bash</span>
  <pre><code class="language-bash">cargo flamegraph --bin my_program</code></pre>
</div>

<p>This produces <code>flamegraph.svg</code> in the current directory. Open it in any browser. You can click into boxes to zoom and search by name. The widest box near the top is your bottleneck.</p>

<h2>What to Look For</h2>

<p>When reading a flamegraph for the first time, focus on three things:</p>

<dl>
  <dt>The widest top-of-stack box</dt>
  <dd>This is the leaf function the program spent the most time inside. It is your most direct optimization target.</dd>
  <dt>Surprises</dt>
  <dd>Functions you did not expect to see, or that look much wider than they should. Memory allocation (<code>malloc</code>, <code>__rust_alloc</code>) showing up huge often means too many <code>Vec</code> resizes or <code>String</code> allocations.</dd>
  <dt>The shape over time</dt>
  <dd>If the same expensive call is happening from many places (a wide function with many callers below it), maybe a single fix benefits many code paths.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Flamegraphs are sampling-based. Functions that ran for less than one sampling interval may not appear at all. Increase the sampling rate (<code>cargo flamegraph -F 4000</code>) if you suspect very fast hot spots are being missed.</p>
</div>

<h2>Other Profiling Tools</h2>

<dl>
  <dt><code>perf record</code> / <code>perf report</code> (Linux)</dt>
  <dd>The lower-level tool that <code>cargo flamegraph</code> wraps. Gives you a text-based, sortable table of functions by sample count.</dd>
  <dt>Instruments (macOS)</dt>
  <dd>Apple's GUI profiler. Excellent for sampling, allocations, and time-profile traces.</dd>
  <dt>Visual Studio Profiler (Windows)</dt>
  <dd>Built into Visual Studio. Works on Rust binaries that include PDB debug info.</dd>
  <dt>tracing (the Rust crate)</dt>
  <dd>Application-level instrumentation. Lets you record spans and events you care about, useful for async code where flamegraphs can be misleading.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Profiling a debug build</h3>
<p>Debug builds spend most of their time in functions that release builds inline away. Always profile <code>--release</code> with <code>debug = true</code> for symbols.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml"># Cargo.toml
[profile.release]
debug = true       # DWARF info for the profiler, no slowdown</code></pre>
</div>

<h3>Mistake 2: Profiling without a representative workload</h3>
<p>If your program processes 10 records during profiling but 10 million in production, the flamegraph reflects startup costs (loading config, opening files), not the hot path. Always profile with realistic input sizes.</p>

<h3>Mistake 3: Optimizing the widest function without checking why it is wide</h3>
<p>If <code>memcpy</code> is at the top of your flamegraph, the answer is not "make memcpy faster." It is "find out who keeps copying memory and make them stop." Always look at the callers (the boxes below) to understand context.</p>

<h3>Mistake 4: Trusting one profiling run</h3>
<p>One run can be skewed by a noisy neighbor process or a particular allocation pattern. Run the profiler twice, compare, and trust the consistent picture.</p>
`
  },

  /* =========================================================
     ch100 — Optimization Strategies
  ========================================================= */
  'ch100': {
    moduleNum: 15,
    moduleTitle: 'Performance Engineering',
    chNum: 100,
    title: 'Optimization Strategies',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 15 &mdash; Chapter 100</span>
</div>
<h1>Optimization Strategies</h1>

<p>You now have the building blocks: zero-cost abstractions, layout-friendly data, cache-friendly access, benchmarks that measure honestly, and profilers that show where the time goes. This final chapter ties it together into a practical workflow for making real Rust code faster, and surveys the most impactful tools the compiler gives you.</p>

<h2>Analogy: Tuning a Car Engine</h2>

<p>A good mechanic does not crack open a car engine and start swapping parts based on a hunch. They put the car on a dynamometer, see what is actually slow, change one thing, measure again, and stop when they hit the target. The same is true of code: optimization without measurement is just rearranging deck chairs. Measure, change one thing, measure, and stop when good enough.</p>

<h2>The Optimization Loop</h2>

<ol>
  <li><strong>Decide a goal.</strong> "Reduce request latency p99 below 50ms" is measurable; "make the server fast" is not.</li>
  <li><strong>Benchmark the current state.</strong> You need a number to compare against later.</li>
  <li><strong>Profile to find the bottleneck.</strong> Spend your effort on the one or two functions that dominate the time.</li>
  <li><strong>Form a hypothesis.</strong> "Most time is in <code>HashMap::get</code> because we hash on every iteration. If I cache the lookup, it should drop."</li>
  <li><strong>Make the smallest possible change.</strong> One change per measurement cycle.</li>
  <li><strong>Re-measure.</strong> Did it actually help? By how much?</li>
  <li><strong>Stop when you hit the goal,</strong> or when further wins are too small to justify the complexity cost.</li>
</ol>

<h2>Where the Big Wins Usually Live</h2>

<p>Most Rust performance bugs come from a small set of patterns. Knowing the list saves a lot of profiling.</p>

<h3>1. Algorithmic Wins Beat Micro-Optimizations</h3>

<p>An O(n^2) algorithm replaced with an O(n log n) one is worth more than any amount of <code>#[inline]</code> tuning. Always ask first: am I doing more work than I need to?</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// O(n^2): for each item, scan everything to find duplicates
fn has_duplicate_naive(v: &amp;[i32]) -&gt; bool {
    for i in 0..v.len() {
        for j in (i+1)..v.len() {
            if v[i] == v[j] { return true; }
        }
    }
    false
}

// O(n) average: hash set membership
use std::collections::HashSet;
fn has_duplicate_set(v: &amp;[i32]) -&gt; bool {
    let mut seen = HashSet::new();
    for &amp;x in v {
        if !seen.insert(x) { return true; }
    }
    false
}</code></pre>
</div>

<h3>2. Avoid Unnecessary Allocation</h3>

<p>Heap allocations are individually fast but they stack up. Patterns that allocate inside a tight loop are common slow-downs.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// SLOW: allocates a new String each call
fn label_v1(n: u32) -&gt; String {
    format!("item-{}", n)
}

// FASTER if the caller has a reusable buffer
use std::fmt::Write;
fn label_v2(buf: &amp;mut String, n: u32) {
    buf.clear();
    write!(buf, "item-{}", n).unwrap();
}</code></pre>
</div>

<h3>3. Pre-Size Collections</h3>

<p><code>Vec</code> and <code>String</code> grow by doubling, which means many small <code>push</code>es trigger several reallocations. If you know roughly how big the collection will be, ask for it up front.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// SLOWER: reallocates as it grows
fn collect_v1(n: usize) -&gt; Vec&lt;u64&gt; {
    let mut v = Vec::new();
    for i in 0..n as u64 { v.push(i * i); }
    v
}

// FASTER: one allocation
fn collect_v2(n: usize) -&gt; Vec&lt;u64&gt; {
    let mut v = Vec::with_capacity(n);
    for i in 0..n as u64 { v.push(i * i); }
    v
}</code></pre>
</div>

<h3>4. Borrow Instead of Clone</h3>

<p>Rust's ownership system makes clones explicit. Each <code>.clone()</code> on a <code>String</code> or <code>Vec</code> is a heap allocation plus a memcpy. Often a borrow does the same job for free.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WASTEFUL: each call allocates a new String
fn count_lines_v1(text: String) -&gt; usize {
    text.lines().count()
}

// FREE: reads through a borrow
fn count_lines_v2(text: &amp;str) -&gt; usize {
    text.lines().count()
}</code></pre>
</div>

<h2>Compiler Hints and Profile Settings</h2>

<h3>Inlining</h3>

<p>The compiler decides what to inline based on heuristics. You can give it nudges:</p>

<dl>
  <dt><code>#[inline]</code></dt>
  <dd>Hint that this function is a good candidate for inlining. Especially useful for small functions in library crates, where the compiler otherwise will not see across crate boundaries.</dd>
  <dt><code>#[inline(always)]</code></dt>
  <dd>Strong instruction to inline. Use sparingly; over-inlining bloats binary size and can hurt cache performance.</dd>
  <dt><code>#[inline(never)]</code></dt>
  <dd>Forbid inlining. Useful for keeping a function visible in profiles or to keep code size down on a cold path.</dd>
  <dt><code>#[cold]</code></dt>
  <dd>Tells the compiler this function is rarely called. The compiler can then arrange the rest of the code for better cache behavior on the common path.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">#[inline]
fn square(x: i32) -&gt; i32 { x * x }

#[cold]
#[inline(never)]
fn handle_unrecoverable_error() -&gt; ! {
    panic!("unrecoverable");
}</code></pre>
</div>

<h3>Cargo Release Profile</h3>

<p>The default release profile is good but not maximal. For an extra few percent, you can opt into more aggressive settings in <code>Cargo.toml</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">toml</span>
  <pre><code class="language-toml">[profile.release]
opt-level = 3       # default. 's' or 'z' optimize for size instead.
lto = "fat"         # link-time optimization across all crates. slower compile, faster runtime.
codegen-units = 1   # one compilation unit lets the optimizer see everything. slower compile.
panic = "abort"     # smaller code, no unwinding tables.</code></pre>
</div>

<dl>
  <dt><code>opt-level</code></dt>
  <dd><code>0</code> for debug, <code>3</code> is the default for release. <code>"s"</code> and <code>"z"</code> trade speed for smaller binaries.</dd>
  <dt><code>lto</code> (Link-Time Optimization)</dt>
  <dd>Lets the optimizer inline across crate boundaries. <code>"thin"</code> is a fast compromise; <code>"fat"</code> is the most thorough.</dd>
  <dt><code>codegen-units</code></dt>
  <dd>The default of 16 lets compilation parallelize but limits cross-function optimization. Setting to 1 produces the fastest binary at the cost of single-threaded compile time.</dd>
  <dt><code>panic</code></dt>
  <dd><code>"unwind"</code> (default) supports <code>catch_unwind</code>. <code>"abort"</code> aborts on panic, removes unwinding code, and shrinks binaries.</dd>
</dl>

<h2>Other Tools in the Toolkit</h2>

<dl>
  <dt>SIMD intrinsics</dt>
  <dd><code>std::arch</code> exposes platform-specific vector instructions. The portable wrapper <code>std::simd</code> is being stabilized but is still nightly-only at the time of writing.</dd>
  <dt>Const evaluation</dt>
  <dd><code>const fn</code> moves work from runtime to compile time. Trivial in cost, easy to overlook.</dd>
  <dt>Profile-guided optimization (PGO)</dt>
  <dd>Run the program with instrumentation, collect a profile, then recompile using that profile. The compiler uses the data to inline the hot paths and pessimize the cold ones. Available through <code>RUSTFLAGS</code>; documented in the rustc book.</dd>
  <dt>Allocator choice</dt>
  <dd>Switching to <code>jemalloc</code> or <code>mimalloc</code> as the global allocator can substantially help allocation-heavy workloads. Available as crates: <code>tikv-jemallocator</code>, <code>mimalloc</code>.</dd>
</dl>

<h2>The Order to Try Things</h2>

<ol>
  <li>Make sure you are running <code>--release</code>.</li>
  <li>Improve the algorithm if Big-O is bad.</li>
  <li>Remove unnecessary allocations and clones.</li>
  <li>Pre-size collections you know the capacity of.</li>
  <li>Improve cache locality (Vec over LinkedList, SoA over AoS, contiguous over scattered).</li>
  <li>Tune the cargo release profile (lto, codegen-units, panic).</li>
  <li>Apply <code>#[inline]</code> where the profiler shows missed inlining.</li>
  <li>If you are still slow, consider SIMD or a different allocator.</li>
</ol>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Premature optimization</h3>
<p>Donald Knuth's most-misquoted line still holds: "premature optimization is the root of all evil." Make the code clear and correct first. Optimize only what the profiler points at.</p>

<h3>Mistake 2: Optimizing without measuring</h3>
<p>"This should be faster" is a hypothesis, not a result. Always benchmark before and after, on the same machine, with realistic input.</p>

<h3>Mistake 3: Changing many things at once</h3>
<p>If you change three things and the program is twice as fast, you do not know which change mattered, or whether one of them actually made things slower. Change one thing per measurement.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// BAD WORKFLOW: change everything, hope for the best
fn process(items: Vec&lt;String&gt;) -&gt; Vec&lt;String&gt; {
    items.iter().map(|s| s.to_uppercase()).collect()
}
// becomes
fn process_v2(items: &amp;[&amp;str]) -&gt; Vec&lt;String&gt; {
    let mut out = Vec::with_capacity(items.len());
    for s in items {
        out.push(s.to_ascii_uppercase());
    }
    out
}
// three changes at once: borrowed input, with_capacity, ascii_uppercase. Which helped?</code></pre>
</div>

<h3>Mistake 4: Sacrificing readability for tiny wins</h3>
<p>A 0.5% speedup that costs you a week of debugging time later is not a win. Reserve hard-to-read optimizations for hot paths that the profiler clearly identifies, and document why the trickier code is there.</p>

<div class="callout">
  <div class="callout-label">Final Word</div>
  <p>Rust's whole design philosophy is that you do not have to choose between safety and speed. By default, idiomatic Rust is already fast. The role of these performance chapters is not to teach you to fight the language, but to recognize when measurements show a real bottleneck and to know which lever to pull. Measure, focus, and stop when good enough.</p>
</div>
`
  }

});
