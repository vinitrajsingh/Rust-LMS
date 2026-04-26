/* ================================================================
   Module 10: Smart Pointers & Advanced Types
   Chapters: 62 - 69  (all complete)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 62: Box<T>
  --------------------------------------------------------------- */
  'ch62': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 62,
    title: 'Box&lt;T&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 62</span>
</div>

<h1>Box&lt;T&gt;: Storing Data on the Heap</h1>

<p>Every value in Rust lives somewhere in memory. By default, values live on the <strong>stack</strong>: a fast, fixed-size region managed in last-in, first-out order. The <strong>heap</strong> is a larger, flexible region where data can be stored when its size is unknown at compile time, or when you want to pass large data around without copying it.</p>

<p><code>Box&lt;T&gt;</code> is Rust's simplest smart pointer. It stores a value of type <code>T</code> on the heap and keeps only a small pointer on the stack. When the box goes out of scope, Rust automatically frees both the pointer and the heap data. You never call <code>malloc</code> or <code>free</code> yourself.</p>

<h2>The Warehouse Receipt Analogy</h2>

<p>Think of the stack as your physical desk. You can keep small, frequently used items on your desk, but you cannot keep an entire filing cabinet there. The heap is a large warehouse. If you receive a 500-page manuscript, you store it in the warehouse and keep only a small retrieval receipt on your desk. That receipt is tiny (just a memory address), but it gives you access to the full manuscript whenever you need it.</p>

<p>A <code>Box&lt;T&gt;</code> is that retrieval receipt: small enough to sit on the stack, yet it points to data of any size living in the warehouse (heap).</p>

<h2>Creating Your First Box</h2>

<p>You create a <code>Box</code> with <code>Box::new(value)</code>. The value moves into the heap, and you get back a box (a pointer) that you can use just like the original value:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let b = Box::new(5);       // the integer 5 now lives on the heap
    println!("b = {}", b);     // Rust auto-derefs the box: prints "b = 5"
}                              // b goes out of scope; heap memory freed automatically</code></pre>
</div>

<pre class="output"><code>b = 5</code></pre>

<p>You can also read the value inside the box using the dereference operator <code>*</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 10;
    let b = Box::new(x);       // x is copied into the heap (i32 is Copy)

    println!("*b = {}", *b);             // manually dereference
    println!("x == *b: {}", x == *b);   // compare original with dereffed box
}</code></pre>
</div>

<pre class="output"><code>*b = 10
x == *b: true</code></pre>

<h2>When to Use Box&lt;T&gt;</h2>

<p>A <code>Box</code> around a small value like a single integer is almost never justified. Reach for <code>Box</code> in three specific situations:</p>

<dl>
  <dt>Recursive types</dt>
  <dd>When a type needs to contain itself (like a linked list node or a tree node), wrapping the recursive part in <code>Box</code> gives the compiler a known, finite size to work with.</dd>
  <dt>Large data transfer</dt>
  <dd>When you need to transfer ownership of a large struct without copying every byte, boxing it ensures only a small pointer is moved on the stack.</dd>
  <dt>Trait objects</dt>
  <dd>When you want to work with values of different concrete types through a shared interface, <code>Box&lt;dyn Trait&gt;</code> lets you store them behind a uniform pointer.</dd>
</dl>

<h2>Recursive Types: Why They Need Box</h2>

<p>Imagine you want to represent a singly-linked list where each node holds an integer and points to the next node. The natural first attempt fails:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// This does NOT compile!
enum List {
    Cons(i32, List),  // ERROR: recursive type \`List\` has infinite size
    Nil,
}</code></pre>
</div>

<p>Rust must know at compile time exactly how many bytes a <code>List</code> occupies. A <code>Cons</code> variant contains an <code>i32</code> plus another <code>List</code>, which contains an <code>i32</code> plus another <code>List</code>, forever. The size is infinite and the compiler rejects it.</p>

<p>The fix is to put the recursive part inside a <code>Box</code>. A box always occupies exactly one pointer's worth of space on the stack, regardless of what it points to:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">enum List {
    Cons(i32, Box&lt;List&gt;),  // Box has a known pointer size: problem solved
    Nil,
}

use List::{Cons, Nil};

fn main() {
    // Builds the list: 1 -&gt; 2 -&gt; 3 -&gt; end
    let list = Cons(1,
        Box::new(Cons(2,
            Box::new(Cons(3,
                Box::new(Nil))))));

    println!("Linked list created successfully!");
}</code></pre>
</div>

<pre class="output"><code>Linked list created successfully!</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>In real Rust programs, you would use <code>Vec&lt;T&gt;</code> for sequences rather than building linked lists manually. The cons list above is a teaching example for understanding recursive data structures and why <code>Box</code> is needed to break the size cycle.</p>
</div>

<h2>Trait Objects with Box&lt;dyn Trait&gt;</h2>

<p>Sometimes you want a collection that holds values of different types, as long as they all share a common ability. Think of a zoo: lions, elephants, and parrots are very different animals, but they all make a sound. You do not need to know the exact animal type upfront; you just need to know it can make a sound when you ask it to.</p>

<p>In Rust, this is done with <code>Box&lt;dyn Trait&gt;</code>. The <code>dyn</code> keyword signals dynamic dispatch: the exact type is looked up at runtime, not compile time.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">trait Shape {
    fn area(&amp;self) -&gt; f64;
    fn name(&amp;self) -&gt; &amp;str;
}

struct Circle    { radius: f64 }
struct Rectangle { width: f64, height: f64 }

impl Shape for Circle {
    fn area(&amp;self) -&gt; f64 { std::f64::consts::PI * self.radius * self.radius }
    fn name(&amp;self) -&gt; &amp;str { "Circle" }
}

impl Shape for Rectangle {
    fn area(&amp;self) -&gt; f64 { self.width * self.height }
    fn name(&amp;self) -&gt; &amp;str { "Rectangle" }
}

fn main() {
    // Different concrete types stored in one Vec through Box&lt;dyn Shape&gt;
    let shapes: Vec&lt;Box&lt;dyn Shape&gt;&gt; = vec![
        Box::new(Circle    { radius: 3.0 }),
        Box::new(Rectangle { width: 4.0, height: 5.0 }),
        Box::new(Circle    { radius: 1.5 }),
    ];

    for shape in &amp;shapes {
        println!("{}: area = {:.2}", shape.name(), shape.area());
    }
}</code></pre>
</div>

<pre class="output"><code>Circle: area = 28.27
Rectangle: area = 20.00
Circle: area = 7.07</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Boxing a small scalar value for no reason</h3>

<p>New Rust programmers sometimes put simple values in a <code>Box</code>, thinking it makes code more "heap-aware." This adds an unnecessary heap allocation for no benefit.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Wasteful: heap allocation for a single integer
fn double(n: Box&lt;i32&gt;) -&gt; Box&lt;i32&gt; {
    Box::new(*n * 2)
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use i32 directly on the stack
fn double(n: i32) -&gt; i32 {
    n * 2
}</code></pre>
</div>

<h3>Mistake 2: Trying to call .drop() directly</h3>

<p>Rust automatically calls <code>drop</code> when a value goes out of scope. Calling it manually would cause a double-free, so Rust forbids it at compile time.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
fn main() {
    let b = Box::new(String::from("hello"));
    b.drop(); // error: explicit use of destructor method
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use std::mem::drop() for early cleanup
fn main() {
    let b = Box::new(String::from("hello"));
    drop(b); // OK: takes ownership and runs the destructor now
    println!("b has already been freed");
}</code></pre>
</div>

<h3>Mistake 3: Forgetting that Box still enforces ownership rules</h3>

<p>A <code>Box&lt;T&gt;</code> has exactly one owner, just like any other Rust value. Moving the box transfers ownership and invalidates the original binding.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
fn main() {
    let b = Box::new(String::from("world"));
    let c = b;            // b is moved into c
    println!("{}", b);    // error: use of moved value: \`b\`
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use c after the move
fn main() {
    let b = Box::new(String::from("world"));
    let c = b;
    println!("{}", c);  // OK: c is the owner now
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 63: Rc<T>
  --------------------------------------------------------------- */
  'ch63': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 63,
    title: 'Rc&lt;T&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 63</span>
</div>

<h1>Rc&lt;T&gt;: Shared Ownership with Reference Counting</h1>

<p>Rust's ownership model normally means one value has exactly one owner. But some programs genuinely need a single piece of data to have multiple owners at once. For example, in a graph data structure, multiple edges might point to the same node. The node should stay alive as long as at least one edge still points to it.</p>

<p><code>Rc&lt;T&gt;</code> (short for <strong>Reference Counted</strong>) is a smart pointer that enables multiple ownership in single-threaded programs. It tracks how many references to a value exist, and only frees the value when the count reaches zero.</p>

<h2>The Shared TV Analogy</h2>

<p>Think of a TV in a shared apartment. When the first person sits down to watch, the TV turns on. When a second person joins, the TV stays on. When a third person comes in, still on. The TV only turns off when the <em>last</em> person leaves the room. An <code>Rc&lt;T&gt;</code> works the same way: the data it wraps stays alive as long as at least one <code>Rc</code> handle to it exists.</p>

<h2>Creating an Rc and Sharing It</h2>

<p>You create an <code>Rc</code> with <code>Rc::new(value)</code>. To give another part of your program a shared handle to the same data, you call <code>Rc::clone(&amp;rc)</code>. This does <strong>not</strong> deep-copy the data; it only increments the reference count and returns a new handle pointing to the same heap allocation.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared data"));
    println!("count after creating a  = {}", Rc::strong_count(&amp;a)); // 1

    let b = Rc::clone(&amp;a);  // b points to the same String; count goes to 2
    println!("count after cloning to b = {}", Rc::strong_count(&amp;a)); // 2

    {
        let c = Rc::clone(&amp;a); // count goes to 3 inside this block
        println!("count after cloning to c = {}", Rc::strong_count(&amp;a)); // 3
    } // c drops here; count decrements automatically

    println!("count after c drops      = {}", Rc::strong_count(&amp;a)); // 2
    println!("value: {}", a);
}</code></pre>
</div>

<pre class="output"><code>count after creating a  = 1
count after cloning to b = 2
count after cloning to c = 3
count after c drops      = 2
value: shared data</code></pre>

<h2>Why Rc::clone() and Not .clone()?</h2>

<p>Calling <code>a.clone()</code> also works, but the Rust community convention is to write <code>Rc::clone(&amp;a)</code>. This is a visual signal to anyone reading the code: the clone is cheap (it only increments a counter), not a deep copy of the data. When you see <code>Rc::clone</code>, you know it is an intentional reference-count increment, not an expensive data duplication.</p>

<h2>Shared List: A Practical Example</h2>

<p>The problem <code>Rc</code> solves is visible with a shared-tail linked list. Two lists share the same tail without copying it:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, Rc&lt;List&gt;),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    // shared_tail: 10 -&gt; Nil
    let shared_tail = Rc::new(Cons(10, Rc::new(Nil)));

    // list_a: 5 -&gt; 10 -&gt; Nil  (shares shared_tail)
    let list_a = Cons(5, Rc::clone(&amp;shared_tail));

    // list_b: 3 -&gt; 10 -&gt; Nil  (also shares shared_tail)
    let list_b = Cons(3, Rc::clone(&amp;shared_tail));

    // strong_count is 3: shared_tail + list_a's clone + list_b's clone
    println!("shared_tail strong count = {}", Rc::strong_count(&amp;shared_tail));
}</code></pre>
</div>

<pre class="output"><code>shared_tail strong count = 3</code></pre>

<p>If you had used <code>Box&lt;List&gt;</code> instead, moving <code>shared_tail</code> into <code>list_a</code> would invalidate it, and <code>list_b</code> could not use it at all. <code>Rc</code> solves this elegantly.</p>

<h2>Rc Gives Only Immutable Access</h2>

<p>An important constraint: <code>Rc&lt;T&gt;</code> gives you only <strong>immutable</strong> references to the inner value. Multiple owners share the same data, so Rust cannot safely let any one of them mutate it without coordination. If you need shared <em>mutable</em> access, you combine <code>Rc&lt;T&gt;</code> with <code>RefCell&lt;T&gt;</code> (interior mutability, covered later in this course).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::Rc;

fn main() {
    let a = Rc::new(5);
    let b = Rc::clone(&amp;a);

    println!("a = {}, b = {}", a, b); // OK: reading is fine

    // *a = 10; // ERROR: cannot assign to data in an Rc
    // Rc only gives shared (&amp;) access, not exclusive (&amp;mut) access
}</code></pre>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using Rc&lt;T&gt; across threads</h3>

<p><code>Rc&lt;T&gt;</code> is intentionally not thread-safe. Its reference count is a plain integer with no atomic guarantees. The compiler catches this at compile time.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
use std::rc::Rc;
use std::thread;

fn main() {
    let rc = Rc::new(5);
    thread::spawn(move || {
        println!("{}", rc);
        // error: \`Rc&lt;i32&gt;\` cannot be sent between threads safely
        // the trait \`Send\` is not implemented for \`Rc&lt;i32&gt;\`
    });
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use Arc&lt;T&gt; for multi-threaded shared ownership (Chapter 64)
use std::sync::Arc;
use std::thread;

fn main() {
    let arc = Arc::new(5);
    let arc_clone = Arc::clone(&amp;arc);
    let handle = thread::spawn(move || println!("{}", arc_clone));
    handle.join().unwrap();
}</code></pre>
</div>

<h3>Mistake 2: Creating reference cycles that leak memory</h3>

<p>If two <code>Rc</code> values hold strong references to each other, neither count ever reaches zero, and the memory is never freed. This is a memory leak. Use <code>Weak&lt;T&gt;</code> (Chapter 65) to break cycles.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    next: Option&lt;Rc&lt;RefCell&lt;Node&gt;&gt;&gt;,
}

fn main() {
    let a = Rc::new(RefCell::new(Node { value: 1, next: None }));
    let b = Rc::new(RefCell::new(Node { value: 2, next: Some(Rc::clone(&amp;a)) }));

    // Creating a cycle: a -&gt; b -&gt; a
    a.borrow_mut().next = Some(Rc::clone(&amp;b));

    // strong_count stays at 2 for both even after they go out of scope.
    // Memory is leaked!
    println!("a count = {}, b count = {}", Rc::strong_count(&amp;a), Rc::strong_count(&amp;b));
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 64: Arc<T>
  --------------------------------------------------------------- */
  'ch64': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 64,
    title: 'Arc&lt;T&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 64</span>
</div>

<h1>Arc&lt;T&gt;: Thread-Safe Shared Ownership</h1>

<p>In the previous chapter, you saw that <code>Rc&lt;T&gt;</code> enables shared ownership in single-threaded code. But when you work with multiple threads, you need a reference-counted smart pointer whose count can be updated safely even when multiple threads increment or decrement it simultaneously.</p>

<p><code>Arc&lt;T&gt;</code> stands for <strong>Atomically Reference Counted</strong>. It works exactly like <code>Rc&lt;T&gt;</code>, but uses atomic (hardware-level, indivisible) operations to update the reference count. This makes it safe to share across threads.</p>

<h2>The Master Key Analogy</h2>

<p>Imagine a building manager who hands out copies of a master key to security guards working different shifts. All guards hold the same key (shared ownership), and the manager keeps a count of how many copies are out. The critical detail: when a guard finishes their shift and returns the key, the count must be updated in a way that cannot be corrupted even if two guards return their keys at the exact same moment. Atomic operations guarantee this accuracy. <code>Arc&lt;T&gt;</code> is the master key, and atomic hardware instructions are what keep the copy count perfectly accurate.</p>

<h2>Sharing Data Across Threads</h2>

<p>The canonical use of <code>Arc&lt;T&gt;</code> is to give multiple threads read access to the same data. Each thread gets a clone of the Arc (incrementing the count), and when all threads finish and their clones drop, the data is freed.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Arc;
use std::thread;

fn main() {
    let data = Arc::new(vec![1, 2, 3, 4, 5]);
    let mut handles = vec![];

    for i in 0..3 {
        let data = Arc::clone(&amp;data); // clone the Arc, not the Vec
        let handle = thread::spawn(move || {
            let sum: i32 = data.iter().sum();
            println!("Thread {}: sum = {}", i, sum);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Main thread still has the data: {:?}", data);
}</code></pre>
</div>

<pre class="output"><code>Thread 0: sum = 15
Thread 1: sum = 15
Thread 2: sum = 15
Main thread still has the data: [1, 2, 3, 4, 5]</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Thread output order is non-deterministic. Your program might print the threads in a different sequence. That is normal for multi-threaded programs.</p>
</div>

<h2>Arc&lt;T&gt; Does Not Enable Mutation</h2>

<p>Like <code>Rc&lt;T&gt;</code>, an <code>Arc&lt;T&gt;</code> alone only gives shared (<code>&amp;T</code>) access. If multiple threads could mutate the same data simultaneously without coordination, they could corrupt it. To enable shared mutation across threads, combine <code>Arc&lt;T&gt;</code> with <code>Mutex&lt;T&gt;</code>, which is covered in Module 11.</p>

<h2>Arc with Mutex: Shared Mutation Across Threads</h2>

<p>Here is a preview of the pattern you will use most often in concurrent Rust. A counter shared between five threads, each incrementing it by one:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0)); // Mutex wraps the data; Arc shares it
    let mut handles = vec![];

    for _ in 0..5 {
        let counter = Arc::clone(&amp;counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap(); // lock: only one thread at a time
            *num += 1;
        }); // lock automatically released when num goes out of scope
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final count: {}", *counter.lock().unwrap()); // 5
}</code></pre>
</div>

<pre class="output"><code>Final count: 5</code></pre>

<h2>Arc vs Rc: When to Use Which</h2>

<dl>
  <dt>Use Rc&lt;T&gt;</dt>
  <dd>When you are working entirely within a single thread and want shared ownership. <code>Rc</code> is faster because its reference count operations are not atomic.</dd>
  <dt>Use Arc&lt;T&gt;</dt>
  <dd>When you need to share data across multiple threads. The atomic operations add a small overhead, but that is the price of thread safety.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The Rust compiler enforces this distinction automatically. If you try to send an <code>Rc&lt;T&gt;</code> to a thread, the compiler will produce a clear error telling you to use <code>Arc&lt;T&gt;</code> instead.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using Arc where Rc would do</h3>

<p>Using <code>Arc</code> in single-threaded code is not wrong, but it is unnecessary. Atomic operations are slightly slower than plain integer operations. Prefer <code>Rc</code> when threads are not involved.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Unnecessary overhead in single-threaded code
use std::sync::Arc;
let a = Arc::new(5);
let b = Arc::clone(&amp;a);</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Preferred for single-threaded code
use std::rc::Rc;
let a = Rc::new(5);
let b = Rc::clone(&amp;a);</code></pre>
</div>

<h3>Mistake 2: Thinking Arc&lt;T&gt; alone prevents data races</h3>

<p><code>Arc&lt;T&gt;</code> only makes the <em>reference count</em> thread-safe. The <em>data inside</em> is still only accessible via a shared reference, so mutation still requires a locking mechanism like <code>Mutex&lt;T&gt;</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile! Arc alone cannot give mutable access
use std::sync::Arc;
use std::thread;

fn main() {
    let v = Arc::new(vec![1, 2, 3]);
    let v2 = Arc::clone(&amp;v);
    thread::spawn(move || {
        v2.push(4); // error: cannot borrow data in an \`Arc\` as mutable
    });
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: wrap with Mutex for shared mutable access
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let v = Arc::new(Mutex::new(vec![1, 2, 3]));
    let v2 = Arc::clone(&amp;v);
    let handle = thread::spawn(move || {
        v2.lock().unwrap().push(4); // lock first, then mutate
    });
    handle.join().unwrap();
    println!("{:?}", *v.lock().unwrap()); // [1, 2, 3, 4]
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 65: Weak<T>
  --------------------------------------------------------------- */
  'ch65': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 65,
    title: 'Weak&lt;T&gt;',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 65</span>
</div>

<h1>Weak&lt;T&gt;: Non-Owning References and Breaking Cycles</h1>

<p>You now know that <code>Rc&lt;T&gt;</code> keeps data alive by counting strong references. A value is only freed when its strong count reaches zero. But this creates a subtle problem: if two <code>Rc</code> values each hold a strong reference to each other, their counts never reach zero, and their memory is never freed. This is called a <strong>reference cycle</strong>, and it is a memory leak.</p>

<p><code>Weak&lt;T&gt;</code> solves this. It is a non-owning reference: it does not increment the strong count, so it does not prevent the value from being dropped. When you need to observe or navigate to a value without claiming ownership of it, use <code>Weak&lt;T&gt;</code>.</p>

<h2>The Business Card Analogy</h2>

<p>Imagine a colleague gives you their business card. The business card is not an employment contract; it does not keep them employed. If they quit the company, the card still exists in your drawer, but calling the phone number on it will not reach them. You must dial (call <code>upgrade()</code>) to check if they are still reachable before attempting any real work with them.</p>

<p>A <code>Weak&lt;T&gt;</code> is that business card. The card (weak reference) exists, but the person (data) may or may not still be around when you try to use it.</p>

<h2>Creating and Using Weak References</h2>

<p>You create a <code>Weak&lt;T&gt;</code> from an <code>Rc&lt;T&gt;</code> by calling <code>Rc::downgrade(&amp;rc)</code>. To access the data, you call <code>.upgrade()</code> on the weak reference. It returns an <code>Option&lt;Rc&lt;T&gt;&gt;</code>: <code>Some</code> if the data is still alive, <code>None</code> if the data has been dropped.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::{Rc, Weak};

fn main() {
    let strong = Rc::new(String::from("hello"));
    let weak: Weak&lt;String&gt; = Rc::downgrade(&amp;strong); // does not increase strong count

    println!("strong count = {}", Rc::strong_count(&amp;strong)); // 1
    println!("weak count   = {}", Rc::weak_count(&amp;strong));   // 1

    // Try to use the weak reference: returns Some because strong is still alive
    match weak.upgrade() {
        Some(val) =&gt; println!("Value is alive: {}", val),
        None      =&gt; println!("Value has been dropped"),
    }

    drop(strong); // drop the only strong reference

    // Now upgrade returns None: the data was freed
    match weak.upgrade() {
        Some(val) =&gt; println!("Value is alive: {}", val),
        None      =&gt; println!("Value has been dropped"),
    }
}</code></pre>
</div>

<pre class="output"><code>strong count = 1
weak count   = 1
Value is alive: hello
Value has been dropped</code></pre>

<h2>Reference Cycles: How Memory Gets Leaked</h2>

<p>Here is what a reference cycle looks like. Two nodes point to each other with strong <code>Rc</code> references. When the function ends, both counts drop from 2 to 1, never reaching zero:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    next: Option&lt;Rc&lt;RefCell&lt;Node&gt;&gt;&gt;,
}

fn main() {
    let a = Rc::new(RefCell::new(Node { value: 1, next: None }));
    let b = Rc::new(RefCell::new(Node { value: 2, next: Some(Rc::clone(&amp;a)) }));

    // Make a point to b: now a -&gt; b -&gt; a, a cycle
    a.borrow_mut().next = Some(Rc::clone(&amp;b));

    println!("a strong count = {}", Rc::strong_count(&amp;a)); // 2
    println!("b strong count = {}", Rc::strong_count(&amp;b)); // 2

    // When main ends, both counts decrement to 1. Neither is ever freed.
    // This is a memory leak!
}</code></pre>
</div>

<h2>Fixing Cycles with Weak: The Tree Example</h2>

<p>A tree is a perfect example of the cycle problem. A parent node owns its children (strong), but if a child also strongly owns its parent, you have a cycle. The solution: parents own children with strong <code>Rc</code>, children reference parents with weak <code>Weak</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::rc::{Rc, Weak};
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell&lt;Weak&lt;Node&gt;&gt;,           // weak: does not own parent
    children: RefCell&lt;Vec&lt;Rc&lt;Node&gt;&gt;&gt;,      // strong: owns children
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),   // no parent yet
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&amp;leaf)]), // branch owns leaf
    });

    // Give leaf a weak reference back to branch
    *leaf.parent.borrow_mut() = Rc::downgrade(&amp;branch);

    // Navigate from leaf to parent using upgrade()
    if let Some(parent) = leaf.parent.borrow().upgrade() {
        println!("Leaf's parent value = {}", parent.value); // 5
    }

    println!("branch strong = {}, weak = {}",
        Rc::strong_count(&amp;branch),   // 1
        Rc::weak_count(&amp;branch),     // 1 (from the leaf's parent reference)
    );
}</code></pre>
</div>

<pre class="output"><code>Leaf's parent value = 5
branch strong = 1, weak = 1</code></pre>

<p>When <code>branch</code> goes out of scope, its strong count drops to zero and it is freed. The <code>leaf</code>'s weak reference to it becomes invalid. Calling <code>upgrade()</code> after that would return <code>None</code>. No cycle, no leak.</p>

<h2>Strong vs Weak: A Quick Reference</h2>

<dl>
  <dt>Strong reference (Rc::clone)</dt>
  <dd>Expresses ownership. The data stays alive as long as at least one strong reference exists. Created with <code>Rc::clone(&amp;rc)</code>.</dd>
  <dt>Weak reference (Rc::downgrade)</dt>
  <dd>Does not express ownership. The data can be freed while weak references still exist. Access requires calling <code>.upgrade()</code> which returns <code>Option&lt;Rc&lt;T&gt;&gt;</code>. Created with <code>Rc::downgrade(&amp;rc)</code>.</dd>
</dl>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using upgrade() without checking the Option</h3>

<p>If you assume the data is always alive when you call <code>upgrade()</code>, you will panic at runtime when it has been dropped.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Dangerous: panics if the value has been dropped
let val = weak.upgrade().unwrap();
println!("{}", val);</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: always handle the None case
match weak.upgrade() {
    Some(val) =&gt; println!("{}", val),
    None      =&gt; println!("Data was already dropped"),
}</code></pre>
</div>

<h3>Mistake 2: Using Weak when you actually need ownership</h3>

<p>A weak reference is for <em>observing</em> data, not owning it. If your logic requires the data to stay alive for the duration of an operation, upgrade the weak reference to an <code>Rc</code> first and hold onto the <code>Rc</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Subtle bug: the Rc from upgrade() is created and immediately dropped
if weak.upgrade().is_some() {
    // data could be dropped here before the next line runs (in theory)
    process(weak.upgrade().unwrap()); // potentially panics
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: hold the Rc for the duration of the operation
if let Some(strong) = weak.upgrade() {
    process(strong); // strong keeps the data alive for this whole call
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 66: Deref & Drop
  --------------------------------------------------------------- */
  'ch66': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 66,
    title: 'Deref &amp; Drop',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 66</span>
</div>

<h1>Deref and Drop: The Machinery Behind Smart Pointers</h1>

<p>All the smart pointers you have seen so far, <code>Box&lt;T&gt;</code>, <code>Rc&lt;T&gt;</code>, and <code>Arc&lt;T&gt;</code>, share two key traits that give them their power. The <code>Deref</code> trait lets you use a smart pointer as if it were a plain reference. The <code>Drop</code> trait lets you specify what happens when a value goes out of scope. Understanding these two traits gives you the full picture of how smart pointers work under the hood.</p>

<h2>Part 1: The Deref Trait</h2>

<h3>The Gift Box Analogy</h3>

<p>Imagine receiving a gift in a box. What you care about is the gift inside, not the box itself. Dereferencing is like opening the box to get to what is inside. The <code>Deref</code> trait teaches Rust how to open any given box type.</p>

<h3>How * Works on References</h3>

<p>The dereference operator <code>*</code> has always worked on plain references. Here is a reminder:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">fn main() {
    let x = 5;
    let y = &amp;x;          // y is a reference to x

    assert_eq!(5, x);
    assert_eq!(5, *y);   // * dereferences y to get the value x points to
    println!("x = {}, *y = {}", x, *y);
}</code></pre>
</div>

<pre class="output"><code>x = 5, *y = 5</code></pre>

<h3>Implementing Deref on a Custom Type</h3>

<p>The <code>Deref</code> trait requires one method: <code>deref(&amp;self)</code>, which returns a <strong>reference</strong> (not an owned value) to the inner data. When you write <code>*y</code> on a type that implements <code>Deref</code>, Rust automatically expands it to <code>*(y.deref())</code>.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Deref;

struct MyBox&lt;T&gt;(T); // a tuple struct wrapping one value

impl&lt;T&gt; MyBox&lt;T&gt; {
    fn new(x: T) -&gt; MyBox&lt;T&gt; {
        MyBox(x)
    }
}

impl&lt;T&gt; Deref for MyBox&lt;T&gt; {
    type Target = T;               // what deref produces

    fn deref(&amp;self) -&gt; &amp;T {
        &amp;self.0                    // return a reference to the inner value
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);  // Rust calls *(y.deref()) behind the scenes
    println!("*y = {}", *y);
}</code></pre>
</div>

<pre class="output"><code>*y = 5</code></pre>

<h3>Deref Coercion: Automatic Conversions</h3>

<p>Deref coercion is one of Rust's most convenient features. When you pass a reference to a type that implements <code>Deref</code>, Rust will automatically call <code>deref()</code> as many times as needed to match the expected type. This happens at compile time with zero runtime cost.</p>

<p>Think of it as Rust automatically "opening nested boxes" until it reaches the type that fits the function's parameter.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Deref;

struct MyBox&lt;T&gt;(T);

impl&lt;T&gt; MyBox&lt;T&gt; {
    fn new(x: T) -&gt; MyBox&lt;T&gt; { MyBox(x) }
}

impl&lt;T&gt; Deref for MyBox&lt;T&gt; {
    type Target = T;
    fn deref(&amp;self) -&gt; &amp;T { &amp;self.0 }
}

fn hello(name: &amp;str) {
    println!("Hello, {}!", name);
}

fn main() {
    let m = MyBox::new(String::from("Rust"));

    // Deref coercion chain:
    //   &amp;MyBox&lt;String&gt;
    //   -&gt; &amp;String  (MyBox::deref)
    //   -&gt; &amp;str     (String::deref, which is built in)
    hello(&amp;m); // No manual *m or [..] needed!

    // Without deref coercion you would have to write:
    // hello(&amp;(*m)[..]);
}</code></pre>
</div>

<pre class="output"><code>Hello, Rust!</code></pre>

<h2>Part 2: The Drop Trait</h2>

<h3>The Parking Meter Analogy</h3>

<p>Think of a parking meter that automatically notifies the city when it expires. You do not have to call the city yourself to say "my time is up." The meter handles that notification on its own when the time runs out. The <code>Drop</code> trait is Rust's version of that automatic notification: when a value goes out of scope, Rust calls the <code>drop</code> method automatically so you can clean up any resources.</p>

<h3>Implementing Drop</h3>

<p>The <code>Drop</code> trait requires one method: <code>drop(&amp;mut self)</code>. Rust calls it automatically when the value leaves scope. Values are dropped in <strong>reverse order of creation</strong> (last created is first dropped).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Resource {
    name: String,
}

impl Drop for Resource {
    fn drop(&amp;mut self) {
        println!("Releasing: {}", self.name);
    }
}

fn main() {
    let a = Resource { name: String::from("FileHandle") };
    let b = Resource { name: String::from("NetworkSocket") };
    println!("Resources acquired");
    // b is dropped first (created last), then a
}</code></pre>
</div>

<pre class="output"><code>Resources acquired
Releasing: NetworkSocket
Releasing: FileHandle</code></pre>

<h3>Forcing Early Cleanup with std::mem::drop</h3>

<p>Sometimes you want to release a resource before the end of a scope. For example, you might want to release a database lock early so other threads can proceed. Rust forbids calling <code>.drop()</code> directly (to prevent double-frees), but you can call the free function <code>drop(value)</code> from the standard library prelude. It takes ownership of the value and runs its destructor immediately.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Lock {
    id: u32,
}

impl Drop for Lock {
    fn drop(&amp;mut self) {
        println!("Lock {} released", self.id);
    }
}

fn main() {
    let lock = Lock { id: 42 };
    println!("Lock {} acquired", lock.id);

    drop(lock); // early cleanup: releases the lock now

    println!("Doing work without holding the lock");
    // The Drop impl runs here for lock, at the drop() call above,
    // not at the end of main.
}</code></pre>
</div>

<pre class="output"><code>Lock 42 acquired
Lock 42 released
Doing work without holding the lock</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Returning an owned value from deref() instead of a reference</h3>

<p>The <code>deref</code> method must return a reference, not an owned value. Returning an owned value would move the data out of <code>self</code>, which is impossible since <code>self</code> is only a shared reference.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
impl&lt;T&gt; Deref for MyBox&lt;T&gt; {
    type Target = T;
    fn deref(&amp;self) -&gt; T { // error: cannot move out of \`*self\`
        self.0
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: return a reference to the inner value
impl&lt;T&gt; Deref for MyBox&lt;T&gt; {
    type Target = T;
    fn deref(&amp;self) -&gt; &amp;T {
        &amp;self.0   // & gives a reference without moving
    }
}</code></pre>
</div>

<h3>Mistake 2: Calling .drop() directly on a value</h3>

<p>Calling <code>value.drop()</code> explicitly would cause Rust to also call <code>drop</code> again at end of scope, freeing memory twice.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
fn main() {
    let r = Resource { name: String::from("x") };
    r.drop(); // error: explicit use of destructor method
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: the free function drop() is safe to call
fn main() {
    let r = Resource { name: String::from("x") };
    drop(r); // takes ownership; destructor runs exactly once
}</code></pre>
</div>

<h3>Mistake 3: Expecting a specific drop order inside a struct</h3>

<p>Struct fields are dropped in declaration order (not reverse), while local variables are dropped in reverse declaration order.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Pair {
    first: Resource,   // dropped first (fields drop in order)
    second: Resource,  // dropped second
}

fn main() {
    let _p = Pair {
        first:  Resource { name: String::from("A") },
        second: Resource { name: String::from("B") },
    };
    // Output: Releasing A, then Releasing B
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 67: Send & Sync
  --------------------------------------------------------------- */
  'ch67': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 67,
    title: 'Send &amp; Sync',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 67</span>
</div>

<h1>Send and Sync: Thread Safety in Rust's Type System</h1>

<p>Rust prevents data races without a garbage collector by encoding thread safety directly into the type system. Two marker traits, <code>Send</code> and <code>Sync</code>, tell the compiler whether a type can safely cross thread boundaries. If your type passes the checks, it compiles. If it does not, the compiler tells you exactly why, before you ever run the program.</p>

<h2>The Employee Transfer Analogy</h2>

<p><strong>Send:</strong> Think of an employee who can be safely <em>transferred</em> to a different office. They take all their work with them and the original office has nothing left. Some employees cannot transfer (they hold a non-transferable security badge tied to the building); those employees are "not Send."</p>

<p><strong>Sync:</strong> Think of a whiteboard in an open office that multiple people can <em>safely read</em> at the same time without any one person erasing it mid-read. A whiteboard that can only be read safely when nobody else is writing to it is "not Sync."</p>

<h2>What Send Means</h2>

<p>A type is <code>Send</code> if it is safe to <strong>transfer ownership</strong> of a value of that type to another thread. Almost all Rust types are <code>Send</code>: integers, strings, <code>Vec</code>, <code>Box</code>, <code>Arc</code>, and more. The notable exception is <code>Rc&lt;T&gt;</code>, because its reference count is not atomic and could be corrupted if two threads decremented it simultaneously.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::thread;

fn main() {
    let data = String::from("hello"); // String is Send

    let handle = thread::spawn(move || {
        // data is safely moved into this thread
        println!("Thread received: {}", data);
    });

    handle.join().unwrap();
}</code></pre>
</div>

<pre class="output"><code>Thread received: hello</code></pre>

<h2>What Sync Means</h2>

<p>A type <code>T</code> is <code>Sync</code> if it is safe to <strong>share a reference</strong> (<code>&amp;T</code>) across multiple threads simultaneously. Equivalently, <code>T</code> is <code>Sync</code> if <code>&amp;T</code> is <code>Send</code>. Most primitive types and immutable types are <code>Sync</code>. <code>RefCell&lt;T&gt;</code> is not <code>Sync</code> because it allows interior mutation without locking, which is unsafe when multiple threads do it at once.</p>

<h2>Automatic Derivation</h2>

<p>You almost never need to think about <code>Send</code> and <code>Sync</code> manually. The compiler derives them automatically: if all fields of a struct are <code>Send</code>, the struct is <code>Send</code>. If all fields are <code>Sync</code>, the struct is <code>Sync</code>. You get thread safety for free when you compose thread-safe types.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// All fields are Send + Sync, so the struct is automatically Send + Sync
struct Point {
    x: f64,   // f64 is Send + Sync
    y: f64,   // f64 is Send + Sync
}

// This compiles: Point satisfies the thread::spawn requirement
use std::thread;

fn main() {
    let p = Point { x: 1.0, y: 2.0 };
    let handle = thread::spawn(move || {
        println!("({}, {})", p.x, p.y);
    });
    handle.join().unwrap();
}</code></pre>
</div>

<h2>Types That Are Not Send or Not Sync</h2>

<dl>
  <dt>Rc&lt;T&gt; — neither Send nor Sync</dt>
  <dd>Its reference count is a plain integer. Concurrent modification from two threads would be a data race.</dd>
  <dt>RefCell&lt;T&gt; — Send but not Sync</dt>
  <dd>It can be sent to another thread (ownership transfer is fine), but you cannot share a <code>&amp;RefCell</code> across threads because its interior mutability has no lock.</dd>
  <dt>Raw pointers (*const T, *mut T) — neither Send nor Sync</dt>
  <dd>They carry no safety guarantees at all; the compiler conservatively treats them as thread-unsafe.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Demonstrating that the compiler enforces Send at the type level
fn assert_send&lt;T: Send&gt;(_: T) {}

fn main() {
    assert_send(42i32);                    // OK
    assert_send(String::from("hello"));    // OK
    assert_send(std::sync::Arc::new(5));  // OK

    // assert_send(std::rc::Rc::new(5));
    // ERROR: \`Rc&lt;i32&gt;\` cannot be sent between threads safely
}</code></pre>
</div>

<h2>Manual Implementation (Advanced)</h2>

<p>Implementing <code>Send</code> or <code>Sync</code> manually requires <code>unsafe</code> because you are taking responsibility for correctness that the compiler cannot verify. This is only needed when building low-level abstractions like custom concurrent data structures.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Only do this if you have carefully verified thread safety yourself.
struct MyWrapper(*mut u8);

// Safety: we guarantee no other thread holds a reference to this pointer
// while it is being sent.
unsafe impl Send for MyWrapper {}

// Safety: we guarantee all accesses are properly synchronized.
unsafe impl Sync for MyWrapper {}</code></pre>
</div>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Manually implementing <code>Send</code> or <code>Sync</code> incorrectly can cause undefined behavior. Only do this inside an <code>unsafe</code> block after a thorough safety analysis. Most programs never need to implement these traits manually.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Trying to share Rc&lt;T&gt; across threads</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
use std::rc::Rc;
use std::thread;

fn main() {
    let rc = Rc::new(5);
    thread::spawn(move || {
        println!("{}", rc);
        // error: \`Rc&lt;i32&gt;\` cannot be sent between threads safely
    }).join().unwrap();
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use Arc&lt;T&gt; for thread-safe shared ownership
use std::sync::Arc;
use std::thread;

fn main() {
    let arc = Arc::new(5);
    let arc2 = Arc::clone(&amp;arc);
    thread::spawn(move || println!("{}", arc2)).join().unwrap();
    println!("main still has: {}", arc);
}</code></pre>
</div>

<h3>Mistake 2: Thinking all types in the standard library are Send + Sync</h3>

<p><code>RefCell&lt;T&gt;</code>, <code>Cell&lt;T&gt;</code>, and <code>Rc&lt;T&gt;</code> are not <code>Sync</code>. Wrapping them in an <code>Arc</code> does not make them thread-safe because the inner type's operations are still not synchronized.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile! RefCell is not Sync, so Arc&lt;RefCell&lt;T&gt;&gt; is not Send
use std::sync::Arc;
use std::cell::RefCell;
use std::thread;

fn main() {
    let data = Arc::new(RefCell::new(vec![1, 2, 3]));
    let data2 = Arc::clone(&amp;data);
    thread::spawn(move || {
        data2.borrow_mut().push(4); // error: RefCell is not Sync
    });
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use Mutex instead of RefCell for thread-safe interior mutability
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let data = Arc::new(Mutex::new(vec![1, 2, 3]));
    let data2 = Arc::clone(&amp;data);
    let handle = thread::spawn(move || {
        data2.lock().unwrap().push(4);
    });
    handle.join().unwrap();
    println!("{:?}", *data.lock().unwrap()); // [1, 2, 3, 4]
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 68: Newtype Pattern
  --------------------------------------------------------------- */
  'ch68': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 68,
    title: 'Newtype Pattern',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 68</span>
</div>

<h1>The Newtype Pattern</h1>

<p>Rust has a rule called the <strong>orphan rule</strong>: you can only implement a trait on a type if either the trait or the type is defined in your own crate. This prevents two different crates from implementing the same trait on the same type in conflicting ways.</p>

<p>But what if you want to implement an external trait (like <code>Display</code> from the standard library) on an external type (like <code>Vec&lt;String&gt;</code>)? Both are defined outside your crate, so the orphan rule blocks you.</p>

<p>The <strong>newtype pattern</strong> is the standard solution: wrap the external type in a thin tuple struct that you define yourself. Now the wrapper type is local to your crate, and you can implement any trait on it.</p>

<h2>The Rebranded Product Analogy</h2>

<p>Imagine a store that buys plain white mugs from a manufacturer (external type) and sells them under their own brand by adding a colored label (wrapper). The mug itself has not changed. But because the store controls the label, they can print whatever they want on it (implement any trait). Customers who want the unbranded mug can just remove the label (access <code>self.0</code>). The cost of adding and removing the label is zero.</p>

<h2>Implementing an External Trait on an External Type</h2>

<p>Suppose you want <code>Vec&lt;String&gt;</code> to print as a comma-separated list when used with <code>println!</code>. <code>Vec</code> does not implement <code>Display</code>, and you cannot add it because both are from the standard library. The newtype pattern lets you work around this:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::fmt;

struct Wrapper(Vec&lt;String&gt;); // a one-field tuple struct

impl fmt::Display for Wrapper {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "[{}]", self.0.join(", ")) // self.0 accesses the inner Vec
    }
}

fn main() {
    let w = Wrapper(vec![
        String::from("hello"),
        String::from("world"),
        String::from("rust"),
    ]);
    println!("w = {}", w); // w = [hello, world, rust]
}</code></pre>
</div>

<pre class="output"><code>w = [hello, world, rust]</code></pre>

<h2>Type Safety: Distinct Types for Distinct Concepts</h2>

<p>The newtype pattern is also used to create type-safe wrappers even when the underlying data is the same. Imagine your program works with user IDs and order IDs, both stored as <code>u32</code>. Without newtypes, nothing stops you from accidentally passing an order ID where a user ID is expected. With newtypes, the compiler catches the mistake:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct UserId(u32);
struct OrderId(u32);

fn find_user(id: UserId) {
    println!("Looking up user {}", id.0);
}

fn find_order(id: OrderId) {
    println!("Looking up order {}", id.0);
}

fn main() {
    let user  = UserId(42);
    let order = OrderId(100);

    find_user(user);    // OK
    find_order(order);  // OK

    // find_user(order); // ERROR: expected UserId, found OrderId
    // find_order(user); // ERROR: expected OrderId, found UserId
}</code></pre>
</div>

<pre class="output"><code>Looking up user 42
Looking up order 100</code></pre>

<p>The two types look identical at runtime (both are just <code>u32</code>), but the compiler treats them as completely different types. Zero runtime cost, full compile-time safety.</p>

<h2>Accessing the Inner Value</h2>

<p>The inner value is always accessible through tuple field syntax. For a newtype <code>struct Meters(f64)</code>, you access the <code>f64</code> with <code>.0</code>:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Meters(f64);
struct Seconds(f64);

fn speed(distance: Meters, time: Seconds) -&gt; f64 {
    distance.0 / time.0  // access inner f64 values
}

fn main() {
    let d = Meters(100.0);
    let t = Seconds(9.58);
    println!("Speed: {:.2} m/s", speed(d, t)); // Speed: 10.44 m/s
}</code></pre>
</div>

<pre class="output"><code>Speed: 10.44 m/s</code></pre>

<h2>Delegating Methods with Deref</h2>

<p>One downside of the newtype pattern: the wrapper does not automatically inherit the inner type's methods. If you call <code>wrapper.len()</code> and <code>Vec</code> has a <code>len</code> method, you get a compile error. You have two options: implement every method you need manually, or implement <code>Deref</code> to automatically forward all method calls to the inner type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Deref;
use std::fmt;

struct Wrapper(Vec&lt;String&gt;);

// Implement Deref so all Vec methods are available on Wrapper
impl Deref for Wrapper {
    type Target = Vec&lt;String&gt;;
    fn deref(&amp;self) -&gt; &amp;Vec&lt;String&gt; {
        &amp;self.0
    }
}

impl fmt::Display for Wrapper {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("a"), String::from("b")]);
    println!("len = {}", w.len());   // Vec::len via Deref
    println!("w = {}", w);           // Display impl
}</code></pre>
</div>

<pre class="output"><code>len = 2
w = [a, b]</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Implementing <code>Deref</code> means that all of the inner type's methods become available, including ones you did not intend to expose. If you want to restrict which methods are accessible, implement them individually without <code>Deref</code>.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using a type alias instead of a newtype when safety is needed</h3>

<p>A type alias is just another name for the same type. The compiler treats them as identical and will not catch mixing them up. A newtype creates a genuinely distinct type.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Type aliases do NOT provide type safety!
type UserId  = u32;
type OrderId = u32;

fn find_user(id: UserId) { println!("user {}", id); }

fn main() {
    let order: OrderId = 99;
    find_user(order); // Compiles! No error! UserId and OrderId are both just u32.
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: use newtypes for genuine type distinction
struct UserId(u32);
struct OrderId(u32);

fn find_user(id: UserId) { println!("user {}", id.0); }

fn main() {
    let order = OrderId(99);
    // find_user(order); // ERROR at compile time: type mismatch
}</code></pre>
</div>

<h3>Mistake 2: Forgetting to implement Deref when you want inner methods</h3>

<p>A newtype does not automatically inherit methods from the inner type. Without <code>Deref</code>, you must call methods on <code>self.0</code> explicitly or delegate them manually.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">struct Names(Vec&lt;String&gt;);

fn main() {
    let n = Names(vec![String::from("Alice")]);
    // n.len(); // ERROR: method \`len\` not found in type \`Names\`
    println!("{}", n.0.len()); // Must go through .0 manually
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::ops::Deref;

struct Names(Vec&lt;String&gt;);

impl Deref for Names {
    type Target = Vec&lt;String&gt;;
    fn deref(&amp;self) -&gt; &amp;Vec&lt;String&gt; { &amp;self.0 }
}

fn main() {
    let n = Names(vec![String::from("Alice")]);
    println!("{}", n.len()); // Now works: Deref forwards to Vec::len
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 69: Phantom Types
  --------------------------------------------------------------- */
  'ch69': {
    moduleNum: 10,
    moduleTitle: 'Smart Pointers &amp; Advanced Types',
    chNum: 69,
    title: 'Phantom Types',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 10 &mdash; Chapter 69</span>
</div>

<h1>Phantom Types and PhantomData</h1>

<p>Sometimes you need a type to carry extra information that exists only at compile time, with zero impact at runtime. For example, you might have a <code>Distance</code> value and want the type system to know whether it is in kilometers or miles, so that mixing units is a compile error rather than a silent bug. The data itself is just a <code>f64</code>; the unit information is a compile-time label.</p>

<p>Rust's mechanism for this is <strong><code>PhantomData&lt;T&gt;</code></strong>. It is a zero-sized type from the standard library. Adding a field of type <code>PhantomData&lt;Tag&gt;</code> to your struct costs nothing at runtime (no bytes, no allocation), but it tells the compiler that your struct logically involves the type <code>Tag</code>. This changes how the compiler reasons about ownership, variance, and trait implementations.</p>

<h2>The Color-Coded Folder Analogy</h2>

<p>Think of a filing cabinet with color-coded folders. An orange folder means "confidential", a green folder means "public." The color is not the content; it is a zero-cost label that changes how the folder is handled. You would never pass a green folder to a function expecting orange. <code>PhantomData</code> is Rust's way of attaching a color label to a type without storing any extra bytes.</p>

<h2>Unit-Safe Arithmetic with Phantom Types</h2>

<p>Here is the classic use case: a <code>Distance</code> type that is parameterized by a unit. Two distances in different units cannot be added together because they are different types at the type level, even though both store a plain <code>f64</code> at runtime.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

// These are zero-sized unit marker types. They store no data.
struct Km;
struct Miles;

struct Distance&lt;Unit&gt; {
    value: f64,
    _unit: PhantomData&lt;Unit&gt;,  // zero-sized; just carries the Unit type
}

impl&lt;Unit&gt; Distance&lt;Unit&gt; {
    fn new(value: f64) -&gt; Distance&lt;Unit&gt; {
        Distance { value, _unit: PhantomData }
    }

    fn value(&amp;self) -&gt; f64 {
        self.value
    }
}

// Only defined for Km: you cannot add a Miles distance here
impl Distance&lt;Km&gt; {
    fn add(&amp;self, other: &amp;Distance&lt;Km&gt;) -&gt; Distance&lt;Km&gt; {
        Distance::new(self.value + other.value)
    }
}

fn main() {
    let d1 = Distance::&lt;Km&gt;::new(100.0);
    let d2 = Distance::&lt;Km&gt;::new(50.0);
    let total = d1.add(&amp;d2);
    println!("Total: {} km", total.value()); // 150 km

    let d3 = Distance::&lt;Miles&gt;::new(30.0);
    // d1.add(&amp;d3); // ERROR: expected Distance&lt;Km&gt;, found Distance&lt;Miles&gt;
}</code></pre>
</div>

<pre class="output"><code>Total: 150 km</code></pre>

<p>The memory layout of <code>Distance&lt;Km&gt;</code> and <code>Distance&lt;Miles&gt;</code> is identical: just one <code>f64</code>. The unit information is entirely erased at runtime. Yet the compiler uses it to reject unit mismatches at compile time. This is called a <strong>zero-cost abstraction</strong>.</p>

<h2>Compile-Time State Machines with Phantom Types</h2>

<p>A powerful application of phantom types is encoding valid state transitions in the type system. The idea: create a struct parameterized by a phantom state type. Certain methods are only available in certain states. Trying to call a method in the wrong state is a compile error.</p>

<p>Here is a simplified server configuration builder. You cannot call <code>connect()</code> until the configuration has been built:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

struct Unbuilt;  // phantom state: configuration not yet finalized
struct Built;    // phantom state: configuration is ready

struct Config&lt;State&gt; {
    host: String,
    port: u16,
    _state: PhantomData&lt;State&gt;,
}

// Methods available only when in the Unbuilt state
impl Config&lt;Unbuilt&gt; {
    fn new() -&gt; Config&lt;Unbuilt&gt; {
        Config {
            host: String::from("localhost"),
            port: 8080,
            _state: PhantomData,
        }
    }

    fn host(mut self, host: &amp;str) -&gt; Config&lt;Unbuilt&gt; {
        self.host = host.to_string();
        self
    }

    fn port(mut self, port: u16) -&gt; Config&lt;Unbuilt&gt; {
        self.port = port;
        self
    }

    // build() transitions from Unbuilt to Built
    fn build(self) -&gt; Config&lt;Built&gt; {
        println!("Config finalized: {}:{}", self.host, self.port);
        Config {
            host: self.host,
            port: self.port,
            _state: PhantomData,
        }
    }
}

// Methods available only when in the Built state
impl Config&lt;Built&gt; {
    fn connect(&amp;self) {
        println!("Connecting to {}:{}", self.host, self.port);
    }
}

fn main() {
    let config = Config::new()
        .host("example.com")
        .port(443)
        .build();   // transitions to Built state

    config.connect(); // OK: only available on Config&lt;Built&gt;

    // Config::new().connect();
    // ERROR: method \`connect\` not found in \`Config&lt;Unbuilt&gt;\`
}</code></pre>
</div>

<pre class="output"><code>Config finalized: example.com:443
Connecting to example.com:443</code></pre>

<p>This pattern enforces a usage protocol at compile time. There is no way to call <code>connect()</code> on an unbuilt config, and no way to call <code>host()</code> or <code>port()</code> after calling <code>build()</code>. The state machine lives entirely in the type system, with zero runtime overhead.</p>

<h2>Why the Field Starts with an Underscore</h2>

<p>A field named <code>_unit: PhantomData&lt;Unit&gt;</code> starts with an underscore to tell the compiler "this field is intentionally unused in code; do not warn me about it." The underscore is a convention, not a requirement.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

struct Tagged&lt;T&gt; {
    data: String,
    marker: PhantomData&lt;T&gt;,  // warning: field \`marker\` is never read
    // Better:
    // _marker: PhantomData&lt;T&gt;,  // no warning with underscore prefix
}

fn main() {
    let t: Tagged&lt;i32&gt; = Tagged {
        data: String::from("hello"),
        marker: PhantomData,
    };
    println!("{}", t.data);
}</code></pre>
</div>

<h2>What PhantomData Communicates to the Compiler</h2>

<p>Beyond suppressing "unused" warnings, <code>PhantomData</code> has a precise technical meaning. It tells the compiler:</p>

<dl>
  <dt>PhantomData&lt;T&gt;</dt>
  <dd>The struct <em>owns</em> values of type <code>T</code>. This affects drop checking (Rust ensures <code>T</code> is still valid when the struct is dropped) and variance (the struct is covariant over <code>T</code>).</dd>
  <dt>PhantomData&lt;&amp;'a T&gt;</dt>
  <dd>The struct holds a reference to <code>T</code> with lifetime <code>'a</code>. Used in iterators and other types that logically borrow but do not store an actual reference field.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The details of variance and lifetime drop checking are advanced topics covered in the Rustonomicon. For most application-level code, the unit-safety and state-machine patterns above are the practical use cases you will encounter.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting the underscore prefix and getting warnings</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

struct Typed&lt;T&gt; {
    value: i32,
    marker: PhantomData&lt;T&gt;,  // warning: field \`marker\` is never read
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

struct Typed&lt;T&gt; {
    value: i32,
    _marker: PhantomData&lt;T&gt;,  // underscore prefix suppresses the warning
}</code></pre>
</div>

<h3>Mistake 2: Trying to store actual data in PhantomData</h3>

<p><code>PhantomData</code> is purely a compile-time marker. It holds no data and cannot be used to store or retrieve values.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

// Wrong thinking: PhantomData stores nothing; this is just a type tag
struct Wrapper&lt;T&gt; {
    _phantom: PhantomData&lt;T&gt;,
}

fn main() {
    let w: Wrapper&lt;String&gt; = Wrapper { _phantom: PhantomData };
    // w._phantom is zero bytes; you cannot read a String from it
    // let s: String = *w._phantom; // Does not compile; there is no data
}</code></pre>
</div>

<h3>Mistake 3: Confusing phantom types with generics that store data</h3>

<p>A regular generic struct <code>Container&lt;T&gt;</code> with a field <code>data: T</code> actually stores a value of type <code>T</code>. A phantom type uses <code>PhantomData&lt;T&gt;</code> as a field, storing zero bytes, only carrying the type label. The two look similar in declaration but behave very differently.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::marker::PhantomData;

struct StoresData&lt;T&gt; {
    data: T,              // actually holds a T value
}

struct PhantomTag&lt;T&gt; {
    value: i32,
    _tag: PhantomData&lt;T&gt;, // T is a compile-time label only; zero bytes
}

fn main() {
    let a: StoresData&lt;String&gt; = StoresData { data: String::from("real data") };
    println!("{}", a.data); // "real data" lives here

    let b: PhantomTag&lt;String&gt; = PhantomTag { value: 42, _tag: PhantomData };
    println!("{}", b.value); // 42 — the String type tag is compile-time only
}</code></pre>
</div>
`
  },

});
