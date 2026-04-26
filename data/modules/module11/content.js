/* ================================================================
   Module 11: Concurrency & Multithreading
   Chapters: 70 - 76  (all complete)
   ================================================================ */
Object.assign(CHAPTERS_CONTENT, {

  /* ---------------------------------------------------------------
     Chapter 70: Threads
  --------------------------------------------------------------- */
  'ch70': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 70,
    title: 'Threads',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 70</span>
</div>

<h1>Threads: Doing Multiple Things at Once</h1>

<p>A <strong>thread</strong> is an independent stream of execution running inside your program. By default, every Rust program starts with one thread, called the <strong>main thread</strong>. You can spawn additional threads to run code concurrently, letting your program make progress on multiple tasks at the same time.</p>

<p>Concurrent programming opens up a class of bugs that do not exist in single-threaded programs: race conditions, deadlocks, and use-after-free across threads. Rust's ownership system catches many of these at compile time, before you ever run the code.</p>

<h2>The Restaurant Kitchen Analogy</h2>

<p>Think of a restaurant kitchen. The head chef (main thread) manages the kitchen. If there are many orders, the head chef calls in line cooks (spawned threads) to work in parallel. Each cook works independently on their own dish. The head chef can call a cook over and wait for them to finish a task before proceeding. If the restaurant closes (main function ends) before a cook is done, that cook goes home immediately, leaving their dish unfinished.</p>

<h2>Spawning a Thread</h2>

<p>Use <code>thread::spawn</code> from the standard library, passing a closure with the code you want the thread to run. The closure runs concurrently with the rest of your program.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 1..6 {
            println!("spawned thread: count {}", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..4 {
        println!("main thread: count {}", i);
        thread::sleep(Duration::from_millis(1));
    }
    // When main exits here, the spawned thread is killed immediately
    // even if it hasn't finished counting to 5
}</code></pre>
</div>

<pre class="output"><code>main thread: count 1
spawned thread: count 1
main thread: count 2
spawned thread: count 2
main thread: count 3
spawned thread: count 3
spawned thread: count 4</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Your output will likely differ from this. Thread scheduling is controlled by the operating system and is non-deterministic. The threads interleave in whatever order the OS decides. This is normal and expected.</p>
</div>

<h2>Waiting for a Thread to Finish: JoinHandle</h2>

<p><code>thread::spawn</code> returns a <code>JoinHandle&lt;T&gt;</code>. Calling <code>.join()</code> on the handle <strong>blocks</strong> the current thread until the spawned thread finishes. This is how you guarantee work is complete before moving on.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..6 {
            println!("spawned: {}", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..4 {
        println!("main: {}", i);
        thread::sleep(Duration::from_millis(1));
    }

    // Block here until the spawned thread finishes
    handle.join().unwrap();
    println!("All threads done");
}</code></pre>
</div>

<pre class="output"><code>main: 1
spawned: 1
main: 2
spawned: 2
main: 3
spawned: 3
spawned: 4
spawned: 5
All threads done</code></pre>

<h2>Spawning Multiple Threads</h2>

<p>You can spawn many threads and collect all their handles. Joining them in a loop ensures every thread completes before your program exits.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::thread;

fn main() {
    let mut handles = vec![];

    for i in 0..5 {
        let handle = thread::spawn(move || {
            println!("Thread {} is running", i);
        });
        handles.push(handle);
    }

    // Wait for every thread to finish
    for handle in handles {
        handle.join().unwrap();
    }

    println!("All 5 threads completed");
}</code></pre>
</div>

<pre class="output"><code>Thread 0 is running
Thread 2 is running
Thread 1 is running
Thread 4 is running
Thread 3 is running
All 5 threads completed</code></pre>

<h2>Move Closures: Taking Ownership of Data</h2>

<p>Threads might outlive the scope where they were created. If a spawned thread borrows a variable from the outer scope, Rust cannot guarantee the variable will still be alive when the thread uses it. The solution is to <strong>move</strong> data into the closure, transferring ownership to the thread.</p>

<p>Without <code>move</code>, this fails:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    let handle = thread::spawn(|| {
        println!("{:?}", v); // error: closure may outlive current function
    });
    handle.join().unwrap();
}</code></pre>
</div>

<p>Adding <code>move</code> transfers ownership of <code>v</code> into the thread, satisfying the borrow checker:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        // v is now owned by this thread
        println!("vector from main: {:?}", v);
    });

    // v is no longer accessible here; it was moved
    handle.join().unwrap();
}</code></pre>
</div>

<pre class="output"><code>vector from main: [1, 2, 3]</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Forgetting to join and losing thread output</h3>

<p>If you spawn a thread but never join it, the main thread may exit before the spawned thread finishes. The spawned thread's output is simply lost.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Broken: thread may never print anything
use std::thread;
fn main() {
    thread::spawn(|| println!("hello from thread"));
    // main exits immediately; thread is killed before it can print
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: join to wait for the thread
use std::thread;
fn main() {
    let handle = thread::spawn(|| println!("hello from thread"));
    handle.join().unwrap(); // guaranteed to print
}</code></pre>
</div>

<h3>Mistake 2: Borrowing instead of moving data into a thread</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
use std::thread;
fn main() {
    let message = String::from("hello");
    thread::spawn(|| println!("{}", message)); // error: must be 'move' closure
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: move the String into the thread
use std::thread;
fn main() {
    let message = String::from("hello");
    let handle = thread::spawn(move || println!("{}", message));
    handle.join().unwrap();
}</code></pre>
</div>

<h3>Mistake 3: Unwrapping a panicked thread's join result without handling the error</h3>

<p>If a spawned thread panics, <code>join()</code> returns an <code>Err</code>. Calling <code>.unwrap()</code> on it causes the main thread to also panic. Handle the result if thread failures should be recoverable.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        panic!("thread crashed!");
    });

    match handle.join() {
        Ok(_) =&gt; println!("Thread finished successfully"),
        Err(e) =&gt; println!("Thread panicked: {:?}", e),
    }
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 71: Channels
  --------------------------------------------------------------- */
  'ch71': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 71,
    title: 'Channels',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 71</span>
</div>

<h1>Channels: Sending Messages Between Threads</h1>

<p>One of the safest ways for threads to communicate is by <strong>message passing</strong>: instead of sharing memory that both threads can modify, one thread <em>sends</em> data to another through a channel. The Go programming language popularised the slogan: "Do not communicate by sharing memory; share memory by communicating." Rust's <code>std::sync::mpsc</code> module provides this mechanism.</p>

<h2>The Conveyor Belt Analogy</h2>

<p>Think of a factory conveyor belt. Workers on one side (producer threads) place items on the belt. A worker on the other end (the consumer thread) picks items off as they arrive. Items travel one way only: from sender to receiver. Once an item is placed on the belt, the placing worker no longer owns it. The receiving worker takes full ownership. This is exactly how Rust channels work: sending <em>transfers ownership</em>.</p>

<h2>Creating a Channel</h2>

<p><code>mpsc</code> stands for <strong>multiple producer, single consumer</strong>: many threads can send, but only one thread receives. Calling <code>mpsc::channel()</code> gives you a <strong>transmitter</strong> (<code>tx</code>) and a <strong>receiver</strong> (<code>rx</code>).</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel(); // tx = transmitter, rx = receiver

    thread::spawn(move || {
        let message = String::from("hello from thread");
        tx.send(message).unwrap(); // ownership of message moves into the channel
        // message is no longer accessible here
    });

    let received = rx.recv().unwrap(); // blocks until a message arrives
    println!("Received: {}", received);
}</code></pre>
</div>

<pre class="output"><code>Received: hello from thread</code></pre>

<p>Notice that <code>tx.send(message)</code> takes ownership. You cannot use <code>message</code> after sending it. This prevents the sending thread from continuing to modify data that the receiving thread now owns.</p>

<h2>recv() vs try_recv()</h2>

<dl>
  <dt>rx.recv()</dt>
  <dd>Blocks the calling thread until a message arrives. Returns <code>Ok(value)</code> when a message is ready, or <code>Err</code> when the transmitter is dropped (no more messages will ever come). Use this when you have nothing else to do while waiting.</dd>
  <dt>rx.try_recv()</dt>
  <dd>Returns immediately. Returns <code>Ok(value)</code> if a message was ready, or <code>Err</code> if not yet. Use this when your thread has other work to do while waiting for messages.</dd>
</dl>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        thread::sleep(Duration::from_millis(50));
        tx.send("delayed message").unwrap();
    });

    // Poll with try_recv while doing other work
    loop {
        match rx.try_recv() {
            Ok(msg) =&gt; {
                println!("Got: {}", msg);
                break;
            }
            Err(_) =&gt; {
                println!("No message yet, doing other work...");
                thread::sleep(Duration::from_millis(20));
            }
        }
    }
}</code></pre>
</div>

<pre class="output"><code>No message yet, doing other work...
No message yet, doing other work...
Got: delayed message</code></pre>

<h2>Sending Multiple Messages</h2>

<p>A thread can send a stream of values through the channel. The receiver can iterate over incoming messages directly, like a <code>for</code> loop over an iterator. The loop ends automatically when the transmitter is dropped.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let messages = vec!["one", "two", "three", "four"];
        for msg in messages {
            tx.send(msg).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
        // tx drops here, closing the channel
    });

    // Iterates until the channel is closed
    for received in rx {
        println!("Got: {}", received);
    }

    println!("Channel closed, all messages received");
}</code></pre>
</div>

<pre class="output"><code>Got: one
Got: two
Got: three
Got: four
Channel closed, all messages received</code></pre>

<h2>Multiple Producers</h2>

<p>The "multiple producer" in <code>mpsc</code> means you can have several sending threads. Clone the transmitter to give each thread its own copy. All clones send to the same receiver.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    // Producer 1 — uses the original tx
    let tx1 = tx.clone();
    thread::spawn(move || {
        for msg in ["a1", "a2", "a3"] {
            tx1.send(msg).unwrap();
            thread::sleep(Duration::from_millis(50));
        }
    });

    // Producer 2 — uses a clone of tx
    let tx2 = tx.clone();
    thread::spawn(move || {
        for msg in ["b1", "b2", "b3"] {
            tx2.send(msg).unwrap();
            thread::sleep(Duration::from_millis(75));
        }
    });

    // Drop the original tx so the channel closes when both producers finish
    drop(tx);

    for received in rx {
        println!("Got: {}", received);
    }
}</code></pre>
</div>

<pre class="output"><code>Got: a1
Got: b1
Got: a2
Got: a3
Got: b2
Got: b3</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The order in which messages from different producers arrive is non-deterministic. Your output may differ from the example above.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using a value after sending it</h3>

<p><code>send()</code> takes ownership. The value is gone from the sending thread the moment <code>send</code> is called.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile!
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, _rx) = mpsc::channel();
    thread::spawn(move || {
        let val = String::from("hello");
        tx.send(val).unwrap();
        println!("{}", val); // error: value moved by send()
    });
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: do not use val after sending it
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    let handle = thread::spawn(move || {
        let val = String::from("hello");
        tx.send(val).unwrap();
        // val is gone; do other work here instead
    });
    println!("{}", rx.recv().unwrap());
    handle.join().unwrap();
}</code></pre>
</div>

<h3>Mistake 2: Forgetting to drop the original tx when using clones</h3>

<p>If the original <code>tx</code> is still alive when all the clone-based producers finish, the receiver loop never ends because the channel is not fully closed.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Bug: the for loop never ends because the original tx is still alive
let tx2 = tx.clone();
thread::spawn(move || { tx2.send("hello").unwrap(); });
for msg in rx { println!("{}", msg); } // hangs forever</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: drop the original tx so the channel closes when all clones drop
let tx2 = tx.clone();
thread::spawn(move || { tx2.send("hello").unwrap(); });
drop(tx); // now the channel will close when tx2's thread finishes
for msg in rx { println!("{}", msg); } // ends correctly</code></pre>
</div>

<h3>Mistake 3: Calling recv() from multiple threads on the same receiver</h3>

<p><code>mpsc</code> is "single consumer." The <code>Receiver&lt;T&gt;</code> is not <code>Sync</code>, so sharing it across threads is a compile error. If you need multiple consumers, use a crate like <code>crossbeam-channel</code> (note: third-party crate, not in the standard library).</p>
`
  },

  /* ---------------------------------------------------------------
     Chapter 72: Mutex & RwLock
  --------------------------------------------------------------- */
  'ch72': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 72,
    title: 'Mutex &amp; RwLock',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 72</span>
</div>

<h1>Mutex and RwLock: Shared Mutable State Across Threads</h1>

<p>Channels are great for transferring data between threads, but sometimes threads genuinely need to share and mutate the same piece of data in place. For example, a cache shared by a thread pool, or a score counter updated by multiple game threads. For this, Rust provides two locking primitives: <code>Mutex&lt;T&gt;</code> and <code>RwLock&lt;T&gt;</code>.</p>

<h2>Mutex: The Microphone Analogy</h2>

<p>Think of a panel discussion with a single microphone. To speak, a panelist picks up the microphone (acquires the lock). Only one person speaks at a time. When they are done, they set the microphone down (release the lock) so the next person can pick it up. If someone forgets to put it down, everyone else waits indefinitely. A <code>Mutex</code> (mutual exclusion) works the same way: only one thread can access the protected data at a time.</p>

<h2>Using Mutex in a Single Thread</h2>

<p>Start with a simple single-threaded example to understand the API before adding threads:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5); // wraps the value 5

    {
        let mut num = m.lock().unwrap(); // acquire the lock; returns a MutexGuard
        *num = 42;                        // mutate through the guard
    } // MutexGuard drops here, automatically releasing the lock

    println!("m = {:?}", m); // Mutex { data: 42 }
}</code></pre>
</div>

<pre class="output"><code>m = Mutex { data: 42 }</code></pre>

<p>The <code>MutexGuard</code> is a smart pointer (it implements <code>Deref</code> and <code>Drop</code>). You access the data through it, and the lock is released automatically when the guard leaves scope. You never call <code>unlock()</code> manually.</p>

<h2>Mutex Across Multiple Threads: Arc&lt;Mutex&lt;T&gt;&gt;</h2>

<p>To share a <code>Mutex</code> across multiple threads, wrap it in an <code>Arc</code>. Arc gives shared ownership; Mutex gives safe mutation. Together, they are the go-to pattern for shared mutable state in multi-threaded Rust.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&amp;counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
            // lock released here when num goes out of scope
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap()); // always 10
}</code></pre>
</div>

<pre class="output"><code>Result: 10</code></pre>

<p>Without the <code>Mutex</code>, 10 threads racing to increment the same counter could produce any value from 1 to 10 (a data race). With the <code>Mutex</code>, the result is always exactly 10.</p>

<h2>RwLock: The Library Reading Room Analogy</h2>

<p>A library reading room has a simple rule: many people can read books at the same time, but when someone needs to re-shelve (modify) the collection, they need the room to themselves. <code>RwLock&lt;T&gt;</code> (read-write lock) follows the same rule: many threads can hold a read lock simultaneously, but a write lock requires exclusive access.</p>

<p>Use <code>RwLock</code> when reads are frequent and writes are rare, because it avoids the bottleneck of one-at-a-time reads that <code>Mutex</code> imposes.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));
    let mut handles = vec![];

    // Spawn 3 reader threads — they can all read at the same time
    for i in 0..3 {
        let data = Arc::clone(&amp;data);
        handles.push(thread::spawn(move || {
            let r = data.read().unwrap(); // shared read lock
            println!("Reader {}: {:?}", i, *r);
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    // Now perform a single exclusive write
    {
        let mut w = data.write().unwrap(); // exclusive write lock
        w.push(4);
    }

    println!("After write: {:?}", *data.read().unwrap());
}</code></pre>
</div>

<pre class="output"><code>Reader 0: [1, 2, 3]
Reader 1: [1, 2, 3]
Reader 2: [1, 2, 3]
After write: [1, 2, 3, 4]</code></pre>

<h2>Mutex vs RwLock: When to Use Which</h2>

<dl>
  <dt>Mutex&lt;T&gt;</dt>
  <dd>Simpler and always correct. Use it when writes are as frequent as reads, or when the protected section is very short. Locking overhead is minimal.</dd>
  <dt>RwLock&lt;T&gt;</dt>
  <dd>Better throughput when reads dominate. Multiple threads can read the data simultaneously. Use it for caches, configuration, and read-heavy data. Be aware that a long queue of readers can starve writers (platform-dependent).</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>If a thread panics while holding a <code>Mutex</code> lock, the mutex becomes <strong>poisoned</strong>. Subsequent calls to <code>lock()</code> return an <code>Err</code>. Calling <code>.unwrap()</code> propagates the panic. You can recover from a poisoned lock using <code>.into_inner()</code> on the error if you need to.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Holding the lock for too long</h3>

<p>If the lock is held while doing slow work (network calls, file I/O), other threads are blocked the entire time. Keep the critical section as short as possible.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Bad: lock held during slow computation
let mut data = shared.lock().unwrap();
let result = slow_computation(); // other threads wait here!
*data = result;</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Better: compute first, then lock only for the write
let result = slow_computation(); // no lock held
let mut data = shared.lock().unwrap();
*data = result; // lock released immediately after</code></pre>
</div>

<h3>Mistake 2: Trying to use Mutex without Arc in multi-threaded code</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Does NOT compile! Mutex cannot be moved into multiple threads
use std::sync::Mutex;
use std::thread;

fn main() {
    let m = Mutex::new(0);
    for _ in 0..3 {
        thread::spawn(move || {
            *m.lock().unwrap() += 1; // error: m moved into first iteration
        });
    }
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: wrap in Arc for shared ownership
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let m = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..3 {
        let m = Arc::clone(&amp;m);
        handles.push(thread::spawn(move || { *m.lock().unwrap() += 1; }));
    }
    for h in handles { h.join().unwrap(); }
    println!("{}", *m.lock().unwrap()); // 3
}</code></pre>
</div>

<h3>Mistake 3: Locking the same Mutex twice in the same thread</h3>

<p>Calling <code>lock()</code> twice on the same <code>Mutex</code> from the same thread without releasing the first lock will deadlock forever, because the thread is waiting for itself.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Deadlock! Do not do this.
use std::sync::Mutex;
fn main() {
    let m = Mutex::new(0);
    let _g1 = m.lock().unwrap(); // first lock
    let _g2 = m.lock().unwrap(); // deadlock: waiting for _g1 to release
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: release the first lock before acquiring again
use std::sync::Mutex;
fn main() {
    let m = Mutex::new(0);
    { let mut g = m.lock().unwrap(); *g += 1; } // released here
    { let mut g = m.lock().unwrap(); *g += 1; } // now safe to lock again
    println!("{}", *m.lock().unwrap()); // 2
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 73: Deadlocks
  --------------------------------------------------------------- */
  'ch73': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 73,
    title: 'Deadlocks',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 73</span>
</div>

<h1>Deadlocks: When Threads Wait for Each Other Forever</h1>

<p>A <strong>deadlock</strong> is a situation where two or more threads are each waiting for a resource held by the other, so none of them can ever make progress. The program does not crash or print an error. It simply hangs silently, forever.</p>

<p>Unlike data races, which Rust prevents at compile time through the type system, deadlocks are <strong>logic errors</strong> that Rust cannot catch. You must understand how they form and design your code to avoid them.</p>

<h2>The Narrow Bridge Analogy</h2>

<p>Imagine two cars on a narrow one-lane bridge, approaching from opposite ends. Each car has entered the bridge and is now blocking the other. Neither can reverse without the other moving first. They are stuck. A deadlock is exactly this: each thread holds a resource the other needs, and both are waiting.</p>

<h2>How a Deadlock Forms</h2>

<p>The classic deadlock involves two mutexes and two threads. Thread A acquires lock 1, then tries to acquire lock 2. Thread B acquires lock 2, then tries to acquire lock 1. Both are now blocked waiting for each other.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// WARNING: This code DEADLOCKS — it will hang forever.
// For educational illustration only.
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    let lock_a = Arc::new(Mutex::new(0));
    let lock_b = Arc::new(Mutex::new(0));

    let a1 = Arc::clone(&amp;lock_a);
    let b1 = Arc::clone(&amp;lock_b);

    let handle1 = thread::spawn(move || {
        let _ga = a1.lock().unwrap();    // Thread 1 acquires A
        println!("Thread 1 holds A, waiting for B...");
        thread::sleep(Duration::from_millis(10));
        let _gb = b1.lock().unwrap();    // Thread 1 waits for B (held by Thread 2)
        println!("Thread 1 acquired both locks");
    });

    let a2 = Arc::clone(&amp;lock_a);
    let b2 = Arc::clone(&amp;lock_b);

    let handle2 = thread::spawn(move || {
        let _gb = b2.lock().unwrap();    // Thread 2 acquires B
        println!("Thread 2 holds B, waiting for A...");
        thread::sleep(Duration::from_millis(10));
        let _ga = a2.lock().unwrap();    // Thread 2 waits for A (held by Thread 1)
        println!("Thread 2 acquired both locks");
    });

    handle1.join().unwrap(); // hangs forever
    handle2.join().unwrap(); // never reached
}</code></pre>
</div>

<h2>The Four Conditions for a Deadlock</h2>

<p>A deadlock requires all four of these conditions to be present simultaneously:</p>

<dl>
  <dt>1. Mutual exclusion</dt>
  <dd>At least one resource is held in a non-shareable way (e.g., a mutex).</dd>
  <dt>2. Hold and wait</dt>
  <dd>A thread holds at least one resource and is waiting to acquire more.</dd>
  <dt>3. No preemption</dt>
  <dd>Resources cannot be forcibly taken from a thread; the thread must release them voluntarily.</dd>
  <dt>4. Circular wait</dt>
  <dd>There is a cycle: Thread A waits for Thread B, which waits for Thread A.</dd>
</dl>

<p>Breaking <em>any one</em> of these conditions prevents the deadlock.</p>

<h2>Strategy 1: Consistent Lock Ordering</h2>

<p>The simplest and most reliable strategy is to always acquire locks in the <strong>same order</strong> across all threads. If every thread acquires lock A before lock B, no cycle can form.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let lock_a = Arc::new(Mutex::new(0));
    let lock_b = Arc::new(Mutex::new(0));

    let a1 = Arc::clone(&amp;lock_a);
    let b1 = Arc::clone(&amp;lock_b);

    // Both threads acquire A first, then B — same order, no cycle
    let handle1 = thread::spawn(move || {
        let _ga = a1.lock().unwrap(); // A first
        let _gb = b1.lock().unwrap(); // B second
        println!("Thread 1 done");
    });

    let a2 = Arc::clone(&amp;lock_a);
    let b2 = Arc::clone(&amp;lock_b);

    let handle2 = thread::spawn(move || {
        let _ga = a2.lock().unwrap(); // A first (same order)
        let _gb = b2.lock().unwrap(); // B second
        println!("Thread 2 done");
    });

    handle1.join().unwrap();
    handle2.join().unwrap();
    println!("No deadlock!");
}</code></pre>
</div>

<pre class="output"><code>Thread 1 done
Thread 2 done
No deadlock!</code></pre>

<h2>Strategy 2: try_lock() for Non-Blocking Attempts</h2>

<p>Instead of blocking forever with <code>lock()</code>, use <code>try_lock()</code> which returns immediately. If the lock is unavailable, you get an error and can retry, back off, or take another action.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Mutex;

fn main() {
    let m = Mutex::new(42);

    match m.try_lock() {
        Ok(guard) =&gt; println!("Got the lock: {}", *guard),
        Err(_) =&gt; println!("Lock is busy, will try again later"),
    }
}</code></pre>
</div>

<pre class="output"><code>Got the lock: 42</code></pre>

<h2>Strategy 3: Minimize the Number of Locks Held Simultaneously</h2>

<p>The fewer locks a thread holds at the same time, the fewer opportunities for a deadlock cycle. Release a lock as soon as you are done with it, before acquiring the next one.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let lock_a = Arc::new(Mutex::new(0));
    let lock_b = Arc::new(Mutex::new(0));

    let a = Arc::clone(&amp;lock_a);
    let b = Arc::clone(&amp;lock_b);

    thread::spawn(move || {
        {
            let mut ga = a.lock().unwrap();
            *ga += 1;
        } // lock_a released here before acquiring lock_b
        {
            let mut gb = b.lock().unwrap();
            *gb += 1;
        } // lock_b released
    }).join().unwrap();

    println!("a={}, b={}",
        *lock_a.lock().unwrap(),
        *lock_b.lock().unwrap()
    );
}</code></pre>
</div>

<pre class="output"><code>a=1, b=1</code></pre>

<h2>What Rust Can and Cannot Prevent</h2>

<dl>
  <dt>Rust prevents at compile time</dt>
  <dd>Data races (unsynchronized concurrent access to the same memory). The type system, Send, Sync, and the borrow checker eliminate this entire class of bug.</dd>
  <dt>Rust does NOT prevent</dt>
  <dd>Deadlocks. These are logic errors in how your program sequences lock acquisitions. Rust cannot statically verify lock ordering across threads. You must reason about it yourself.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Several Rust crates provide deadlock detection at runtime (for example, by tracking lock acquisition order in a debug build). These can help during development but are not part of the standard library.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Acquiring locks in different orders in different threads</h3>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Deadlock waiting to happen!
// Thread 1: locks A then B
// Thread 2: locks B then A
// Different orderings create a possible cycle.</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: document and enforce a consistent lock ordering.
// Every thread in the program must follow: lock A before B, always.
// A comment or naming convention ("lock ordering: A &lt; B") helps enforce this.</code></pre>
</div>

<h3>Mistake 2: Locking a Mutex recursively from the same thread</h3>

<p>Standard Rust <code>Mutex</code> is not reentrant. If a thread tries to lock a mutex it already holds, it deadlocks with itself.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Deadlock: same thread, same mutex, double lock
use std::sync::Mutex;
fn process(m: &amp;Mutex&lt;i32&gt;) {
    let _g = m.lock().unwrap();
    helper(m); // helper also calls m.lock() — deadlock!
}
fn helper(m: &amp;Mutex&lt;i32&gt;) {
    let _g = m.lock().unwrap(); // waits forever
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: pass the MutexGuard to helper instead of the Mutex
use std::sync::{Mutex, MutexGuard};
fn process(m: &amp;Mutex&lt;i32&gt;) {
    let g = m.lock().unwrap();
    helper(&amp;g); // passes the guard, no second lock needed
}
fn helper(g: &amp;MutexGuard&lt;i32&gt;) {
    println!("value: {}", **g);
}</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 74: Atomics
  --------------------------------------------------------------- */
  'ch74': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 74,
    title: 'Atomics',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 74</span>
</div>

<h1>Atomics: Lock-Free Shared Primitives</h1>

<p>A <code>Mutex</code> is powerful but has overhead: threads must block and wait for the lock to be released. For simple operations on single values, like incrementing a counter or setting a flag, there is a faster alternative: <strong>atomic types</strong>.</p>

<p>An atomic operation is one that the CPU guarantees will complete fully without interruption, even when multiple threads execute it simultaneously. No lock is needed because the hardware enforces the indivisibility. Atomic operations are the foundation of lock-free programming.</p>

<h2>The Turnstile Counter Analogy</h2>

<p>Imagine a turnstile at a subway entrance. Every time someone passes through, the mechanical counter clicks by exactly 1. Even if two people rush through at the same time, each click is guaranteed to be recorded separately. No one needs to "lock" the counter before pushing it. The mechanical design ensures each click is atomic. Rust's atomic types work the same way: the hardware ensures each operation completes cleanly, even under concurrent access.</p>

<h2>The Atomic Types</h2>

<p>Rust's atomic types live in <code>std::sync::atomic</code>. The most commonly used are:</p>

<dl>
  <dt>AtomicBool</dt>
  <dd>A boolean flag safe to share across threads. Useful for "shutdown requested" signals.</dd>
  <dt>AtomicUsize</dt>
  <dd>An unsigned integer the size of a pointer. The most portable atomic integer type.</dd>
  <dt>AtomicI32 / AtomicU32 / AtomicI64 / AtomicU64</dt>
  <dd>Signed and unsigned integers of specific sizes.</dd>
</dl>

<h2>Basic Operations: load, store, and fetch_add</h2>

<p>Here is a shared counter incremented by multiple threads using <code>AtomicUsize</code>. No mutex, no blocking:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

fn main() {
    let counter = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let counter = Arc::clone(&amp;counter);
        let handle = thread::spawn(move || {
            // fetch_add atomically adds 1 and returns the OLD value
            let old = counter.fetch_add(1, Ordering::Relaxed);
            println!("Thread incremented from {}", old);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let final_count = counter.load(Ordering::Relaxed);
    println!("Final count: {}", final_count); // always 5
}</code></pre>
</div>

<pre class="output"><code>Thread incremented from 0
Thread incremented from 1
Thread incremented from 2
Thread incremented from 3
Thread incremented from 4
Final count: 5</code></pre>

<h2>The Ordering Parameter</h2>

<p>Every atomic operation takes an <code>Ordering</code> argument that controls how the operation relates to other memory operations. Think of it as specifying how "strict" the synchronization guarantee is.</p>

<dl>
  <dt>Ordering::Relaxed</dt>
  <dd>Only the atomicity of this single operation is guaranteed. The compiler and CPU may reorder it relative to other operations. Use it when you only need the count to be accurate but do not care about the order in which other data becomes visible.</dd>
  <dt>Ordering::Acquire</dt>
  <dd>Used on loads. Any reads or writes in this thread that come after the load will see all writes that happened before a corresponding Release store in another thread. Like "opening a gate" to let prior writes through.</dd>
  <dt>Ordering::Release</dt>
  <dd>Used on stores. All reads and writes in this thread that come before the store are guaranteed to be visible to any thread that does an Acquire load of the same variable.</dd>
  <dt>Ordering::SeqCst</dt>
  <dd>Sequential consistency: the strongest guarantee. All atomic operations using SeqCst appear to all threads in the same total order. Use this when in doubt; optimize with weaker orderings only when you understand the implications.</dd>
</dl>

<h2>Acquire-Release Pair: Signalling Between Threads</h2>

<p>A common pattern: one thread sets a flag with <code>Release</code>, and another thread reads it with <code>Acquire</code>. This guarantees that any data written before the flag store is visible after the flag load.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

fn main() {
    let ready = Arc::new(AtomicBool::new(false));
    let ready_clone = Arc::clone(&amp;ready);

    let producer = thread::spawn(move || {
        println!("Producer: preparing data...");
        thread::sleep(Duration::from_millis(100));
        // Release: all writes above are visible to anyone who Acquires this flag
        ready_clone.store(true, Ordering::Release);
        println!("Producer: data ready!");
    });

    // Spin-wait until the flag is set
    while !ready.load(Ordering::Acquire) {
        thread::sleep(Duration::from_millis(10));
    }
    println!("Consumer: data is ready, proceeding");

    producer.join().unwrap();
}</code></pre>
</div>

<pre class="output"><code>Producer: preparing data...
Producer: data ready!
Consumer: data is ready, proceeding</code></pre>

<h2>compare_exchange: The Building Block of Lock-Free Algorithms</h2>

<p>The "compare and swap" (CAS) operation atomically checks whether a value equals an expected value, and if so, replaces it with a new value. It returns the old value so you know whether the swap succeeded. This is the fundamental primitive behind many lock-free data structures.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::atomic::{AtomicUsize, Ordering};

fn main() {
    let value = AtomicUsize::new(10);

    // Try to change 10 to 20
    match value.compare_exchange(10, 20, Ordering::SeqCst, Ordering::SeqCst) {
        Ok(old) =&gt; println!("Swapped {} to 20", old),  // succeeded
        Err(actual) =&gt; println!("Expected 10, found {}", actual), // failed
    }

    println!("Current value: {}", value.load(Ordering::SeqCst)); // 20

    // Try again — this time it fails because the value is now 20, not 10
    match value.compare_exchange(10, 99, Ordering::SeqCst, Ordering::SeqCst) {
        Ok(_) =&gt; println!("Swapped again"),
        Err(actual) =&gt; println!("CAS failed, actual value was {}", actual),
    }
}</code></pre>
</div>

<pre class="output"><code>Swapped 10 to 20
Current value: 20
CAS failed, actual value was 20</code></pre>

<h2>Global Atomic Values</h2>

<p>Atomic types can be used as global static variables, which is impossible with <code>Mutex</code> in stable Rust without lazy initialization. This makes them ideal for program-wide counters or flags:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::atomic::{AtomicUsize, Ordering};

static REQUEST_COUNT: AtomicUsize = AtomicUsize::new(0);

fn handle_request() {
    REQUEST_COUNT.fetch_add(1, Ordering::Relaxed);
    // process the request...
}

fn main() {
    handle_request();
    handle_request();
    handle_request();
    println!("Total requests: {}", REQUEST_COUNT.load(Ordering::Relaxed)); // 3
}</code></pre>
</div>

<pre class="output"><code>Total requests: 3</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using Relaxed ordering when ordering guarantees are actually needed</h3>

<p><code>Relaxed</code> only guarantees atomicity of the single operation, not the order of surrounding memory accesses. Using it for a signal-flag without Acquire/Release can cause the consumer to miss data that was written before the flag was set.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Potentially broken: Relaxed does not synchronize the "data" write with the flag read
static FLAG: AtomicBool = AtomicBool::new(false);
static mut DATA: u32 = 0;
// Producer:
unsafe { DATA = 42; }
FLAG.store(true, Ordering::Relaxed); // other thread may see FLAG=true but DATA=0</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: Release on store, Acquire on load establishes happens-before
static FLAG: AtomicBool = AtomicBool::new(false);
static mut DATA: u32 = 0;
// Producer:
unsafe { DATA = 42; }
FLAG.store(true, Ordering::Release); // DATA write is visible before flag is seen as true</code></pre>
</div>

<h3>Mistake 2: Expecting fetch_add to return the new value</h3>

<p><code>fetch_add(n, ordering)</code> returns the <em>old</em> value before the addition, not the new value after it.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::atomic::{AtomicUsize, Ordering};
let c = AtomicUsize::new(5);
let result = c.fetch_add(1, Ordering::Relaxed);
// result is 5 (old value), NOT 6 (new value)
println!("result={}, c={}", result, c.load(Ordering::Relaxed)); // result=5, c=6</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 75: Lock-Free Basics
  --------------------------------------------------------------- */
  'ch75': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 75,
    title: 'Lock-Free Basics',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 75</span>
</div>

<h1>Lock-Free Basics: Concurrency Without Blocking</h1>

<p>In the previous chapter, you learned about atomic operations. This chapter explores how to combine them into <strong>lock-free</strong> patterns: algorithms where threads never block waiting for each other. Instead of queuing up for a mutex, threads use atomic compare-and-swap to make progress or retry.</p>

<p>Lock-free programming is not always the right choice, but for high-performance counters, flags, and simple shared state, it avoids the overhead of locking entirely.</p>

<h2>The Ballot Box Analogy</h2>

<p>Imagine a ballot box at an election. Voters do not need to ask permission or wait for a "mutex" before depositing their ballot. Each voter walks up independently, drops in their ballot, and walks away. The box is designed so that each deposit is self-contained. This is lock-free: each thread does its own atomic operation and moves on, with no waiting involved. A <code>Mutex</code>, by contrast, is like a single voting booth where voters queue and wait for the booth to be free.</p>

<h2>Lock-Free Counter vs Mutex Counter</h2>

<p>For a simple counter incremented by many threads, an atomic counter is simpler and faster than a Mutex:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Lock-free counter using AtomicUsize
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

fn main() {
    let count = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    for _ in 0..8 {
        let count = Arc::clone(&amp;count);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                count.fetch_add(1, Ordering::Relaxed); // no blocking, ever
            }
        }));
    }

    for h in handles { h.join().unwrap(); }

    println!("Total: {}", count.load(Ordering::Relaxed)); // always 8000
}</code></pre>
</div>

<pre class="output"><code>Total: 8000</code></pre>

<p>Eight threads each increment 1000 times with zero blocking. The result is always exactly 8000 because <code>fetch_add</code> is atomic.</p>

<h2>The Compare-and-Swap (CAS) Loop Pattern</h2>

<p>Many lock-free algorithms follow the same pattern: read a value, compute what the new value should be, then try to swap in the new value only if the original is still there. If another thread changed the value in the meantime, retry. This is called a <strong>CAS loop</strong>.</p>

<p>Here is a lock-free maximum update: update a shared maximum if the new value is larger:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

fn update_max(max: &amp;AtomicUsize, value: usize) {
    // CAS loop: keep retrying until we successfully update the max
    loop {
        let current = max.load(Ordering::Relaxed);
        if value &lt;= current {
            break; // current max is already bigger or equal; nothing to do
        }
        // Try to swap current for value. If current changed under us, retry.
        match max.compare_exchange(current, value, Ordering::Relaxed, Ordering::Relaxed) {
            Ok(_) =&gt; break,  // successfully updated max
            Err(_) =&gt; {}     // another thread changed current; loop and retry
        }
    }
}

fn main() {
    let max = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    let values = vec![3, 17, 5, 42, 8, 1, 99, 23];

    for val in values {
        let max = Arc::clone(&amp;max);
        handles.push(thread::spawn(move || {
            update_max(&amp;max, val);
        }));
    }

    for h in handles { h.join().unwrap(); }

    println!("Maximum value seen: {}", max.load(Ordering::Relaxed)); // 99
}</code></pre>
</div>

<pre class="output"><code>Maximum value seen: 99</code></pre>

<h2>When to Use Atomics vs Mutex</h2>

<dl>
  <dt>Use atomics when:</dt>
  <dd>The shared data is a single primitive value (a counter, a flag, a version number). The operation you need maps directly to an atomic operation (<code>fetch_add</code>, <code>store</code>, <code>load</code>, CAS). You want maximum performance for very hot code paths.</dd>
  <dt>Use Mutex when:</dt>
  <dd>The shared data is a complex type (a <code>Vec</code>, a <code>HashMap</code>, a custom struct). The update involves multiple fields that must change together consistently. Simplicity and correctness matter more than squeezing out the last bit of performance.</dd>
</dl>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>Lock-free code is harder to write correctly than lock-based code. Subtle bugs with memory ordering can produce results that are correct 99.99% of the time but fail under specific CPU or load conditions. For most application-level code, <code>Arc&lt;Mutex&lt;T&gt;&gt;</code> is the right default. Reach for atomics when profiling reveals the mutex is a bottleneck.</p>
</div>

<h2>A Simple Spinlock Built from Atomics</h2>

<p>As a deeper example, here is a spinlock: a simple mutual exclusion primitive built entirely from a single <code>AtomicBool</code>. Unlike <code>Mutex</code>, a spinlock does not go to sleep while waiting; it continuously tries to acquire the lock ("spins"). This is efficient when locks are held for very short periods.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::atomic::{AtomicBool, Ordering};
use std::hint;

struct Spinlock {
    locked: AtomicBool,
}

impl Spinlock {
    fn new() -&gt; Spinlock {
        Spinlock { locked: AtomicBool::new(false) }
    }

    fn lock(&amp;self) {
        // Spin until we successfully change false -&gt; true
        while self.locked.compare_exchange(
            false, true,
            Ordering::Acquire,
            Ordering::Relaxed
        ).is_err() {
            hint::spin_loop(); // hint to the CPU: we are spinning
        }
    }

    fn unlock(&amp;self) {
        self.locked.store(false, Ordering::Release);
    }
}

fn main() {
    let spin = Spinlock::new();
    spin.lock();
    println!("Critical section");
    spin.unlock();
    println!("Lock released");
}</code></pre>
</div>

<pre class="output"><code>Critical section
Lock released</code></pre>

<div class="callout">
  <div class="callout-label">Note</div>
  <p>The standard library's <code>Mutex</code> is almost always preferable to a hand-rolled spinlock for real code. Spinlocks waste CPU cycles while spinning and can cause problems on systems where threads may be interrupted while holding the lock. This example is for learning purposes.</p>
</div>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Using a CAS loop incorrectly and creating an infinite retry</h3>

<p>If the retry condition is wrong, the CAS loop never terminates. Always make sure the loop has a clear exit path for both success and "nothing to do."</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::atomic::{AtomicUsize, Ordering};
// Broken: always retries on Err without ever checking if retry makes sense
let a = AtomicUsize::new(0);
loop {
    let old = a.load(Ordering::Relaxed);
    if a.compare_exchange(old, old + 1, Ordering::Relaxed, Ordering::Relaxed).is_err() {
        continue; // may spin forever if contention is constant
    }
    break;
    // Missing: a bound on retries or a "give up" condition
}</code></pre>
</div>

<h3>Mistake 2: Trying to use atomics for complex multi-field updates</h3>

<p>Atomic operations update a <em>single</em> value atomically. If you need to update two fields together as one consistent unit, atomics are not enough. You need a Mutex.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Wrong: two separate atomic updates are not atomic together
use std::sync::atomic::{AtomicUsize, Ordering};
static X: AtomicUsize = AtomicUsize::new(0);
static Y: AtomicUsize = AtomicUsize::new(0);
// Another thread might see X updated but Y not yet updated — inconsistent state
X.fetch_add(1, Ordering::Relaxed);
Y.fetch_add(1, Ordering::Relaxed);</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: wrap both fields in a Mutex for consistent joint updates
use std::sync::Mutex;
struct Point { x: usize, y: usize }
let point = Mutex::new(Point { x: 0, y: 0 });
let mut p = point.lock().unwrap();
p.x += 1;
p.y += 1; // x and y change atomically from other threads' perspective</code></pre>
</div>
`
  },

  /* ---------------------------------------------------------------
     Chapter 76: Fearless Concurrency
  --------------------------------------------------------------- */
  'ch76': {
    moduleNum: 11,
    moduleTitle: 'Concurrency &amp; Multithreading',
    chNum: 76,
    title: 'Fearless Concurrency',
    html: `
<div class="chapter-meta">
  <span class="chapter-badge">Module 11 &mdash; Chapter 76</span>
</div>

<h1>Fearless Concurrency: What Rust's Type System Guarantees</h1>

<p>Concurrent programming has a reputation for being one of the hardest problems in software engineering. Race conditions, deadlocks, and use-after-free bugs across threads are notoriously difficult to reproduce and debug. Rust's promise is "fearless concurrency": you can write concurrent code without being afraid that the compiler will let common mistakes through.</p>

<p>This final chapter of the module pulls together everything you have learned into a clear picture of what Rust guarantees, what it does not, and which tool to reach for in which situation.</p>

<h2>What Rust Prevents at Compile Time</h2>

<p>Rust eliminates entire categories of concurrency bugs through its type system, the <code>Send</code> and <code>Sync</code> traits, and the borrow checker. These are not runtime checks; they happen before your program runs.</p>

<dl>
  <dt>Data races</dt>
  <dd>A data race occurs when two threads access the same memory simultaneously and at least one writes, with no synchronization. Rust prevents this completely. If you try to share mutable data without a <code>Mutex</code>, the compiler rejects your code. You cannot write a data race in safe Rust.</dd>
  <dt>Use-after-free across threads</dt>
  <dd>If you send data to a thread, the ownership moves. The original thread cannot use the data any more. No use-after-free, no dangling pointers across threads.</dd>
  <dt>Sending non-thread-safe types to threads</dt>
  <dd>The <code>thread::spawn</code> function requires the closure to be <code>Send</code>. If your closure captures an <code>Rc&lt;T&gt;</code> (which is not Send), the compiler rejects it. You must use <code>Arc&lt;T&gt;</code> instead.</dd>
</dl>

<h2>What Rust Does NOT Prevent</h2>

<p>Rust's compile-time guarantees are powerful, but they do not cover everything:</p>

<dl>
  <dt>Deadlocks</dt>
  <dd>As covered in Chapter 73, deadlocks are logic errors in lock ordering. The type system cannot verify the sequence of lock acquisitions across threads. You must apply consistent lock ordering and minimise lock hold time yourself.</dd>
  <dt>Livelock</dt>
  <dd>Two threads continuously responding to each other's actions without making real progress. Rare but possible.</dd>
  <dt>Starvation</dt>
  <dd>One thread never gets the lock because others always acquire it first. Not a type-level property.</dd>
  <dt>Logic errors in your concurrent algorithm</dt>
  <dd>If your algorithm is wrong (wrong invariant, off-by-one in the shared state), Rust's type system cannot detect that either.</dd>
</dl>

<h2>The Three Concurrency Tools: When to Use Each</h2>

<p>You now have three main tools. Each fits a different pattern:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Tool 1: Channels — transfer ownership of data between threads
// Use when: one thread produces data that another thread consumes.
use std::sync::mpsc;
use std::thread;

fn channel_example() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || tx.send(String::from("result")).unwrap());
    println!("Got: {}", rx.recv().unwrap());
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Tool 2: Arc&lt;Mutex&lt;T&gt;&gt; — shared mutable state
// Use when: multiple threads need to read and write the same complex data.
use std::sync::{Arc, Mutex};
use std::thread;

fn mutex_example() {
    let shared = Arc::new(Mutex::new(vec![]));
    let mut handles = vec![];
    for i in 0..3 {
        let shared = Arc::clone(&amp;shared);
        handles.push(thread::spawn(move || shared.lock().unwrap().push(i)));
    }
    for h in handles { h.join().unwrap(); }
    println!("{:?}", *shared.lock().unwrap());
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Tool 3: Atomics — lock-free shared primitives
// Use when: multiple threads update a single counter, flag, or version number.
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

fn atomic_example() {
    let count = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];
    for _ in 0..4 {
        let count = Arc::clone(&amp;count);
        handles.push(thread::spawn(move || { count.fetch_add(1, Ordering::Relaxed); }));
    }
    for h in handles { h.join().unwrap(); }
    println!("count = {}", count.load(Ordering::Relaxed)); // 4
}</code></pre>
</div>

<h2>How Send and Sync Make This Work</h2>

<p>The entire concurrency safety model rests on two marker traits covered in Module 10:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// The compiler checks these automatically.
// You never call them directly; they are marker traits.

// thread::spawn requires the closure to be Send.
// This means: everything the closure captures must be Send.
// Rc&lt;T&gt; is NOT Send => capturing Rc causes a compile error.
// Arc&lt;T&gt; IS Send => capturing Arc compiles fine.

// Sharing &amp;T between threads requires T: Sync.
// RefCell&lt;T&gt; is NOT Sync => cannot share &amp;RefCell across threads.
// Mutex&lt;T&gt; IS Sync => safe to share &amp;Mutex across threads via Arc.

fn main() {
    // This is the type-system contract for fearless concurrency:
    //   Arc&lt;Mutex&lt;T&gt;&gt; where T: Send  =>  safe shared mutable state
    //   Arc&lt;T&gt; where T: Send + Sync  =>  safe shared immutable state
    //   mpsc channel where T: Send   =>  safe message passing
}</code></pre>
</div>

<h2>Putting It All Together: A Mini Thread Pool</h2>

<p>Here is a complete example that combines channels (for distributing work) and Arc (for sharing the result counter) across a pool of worker threads:</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">use std::sync::{Arc, Mutex, mpsc};
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel::&lt;i32&gt;();
    let rx = Arc::new(Mutex::new(rx)); // share the receiver among workers
    let result = Arc::new(Mutex::new(0i32));
    let mut handles = vec![];

    // Spawn 3 worker threads
    for id in 0..3 {
        let rx = Arc::clone(&amp;rx);
        let result = Arc::clone(&amp;result);
        handles.push(thread::spawn(move || {
            loop {
                let job = {
                    let r = rx.lock().unwrap();
                    r.recv().ok()
                };
                match job {
                    Some(n) =&gt; {
                        *result.lock().unwrap() += n;
                        println!("Worker {} processed {}", id, n);
                    }
                    None =&gt; break, // channel closed
                }
            }
        }));
    }

    // Send 9 jobs
    for i in 1..=9 {
        tx.send(i).unwrap();
    }
    drop(tx); // close the channel so workers exit their loops

    for h in handles { h.join().unwrap(); }

    println!("Sum of 1..=9: {}", *result.lock().unwrap()); // 45
}</code></pre>
</div>

<pre class="output"><code>Worker 0 processed 1
Worker 1 processed 2
Worker 2 processed 3
Worker 0 processed 4
Worker 1 processed 5
Worker 2 processed 6
Worker 0 processed 7
Worker 1 processed 8
Worker 2 processed 9
Sum of 1..=9: 45</code></pre>

<h2>Common Mistakes</h2>

<h3>Mistake 1: Reaching for threads when the task is I/O-bound</h3>

<p>OS threads have overhead. For programs that spend most time waiting on network or disk I/O, async programming (Tokio, covered in Module 12) is more efficient. Threads shine for CPU-bound work where each thread genuinely needs a CPU core.</p>

<h3>Mistake 2: Thinking "it compiled, so it is definitely correct"</h3>

<p>Rust's compiler eliminates data races and memory safety bugs, but it cannot verify your algorithm's logic. A deadlock-free, data-race-free concurrent program can still produce wrong results if the business logic is incorrect.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Compiles fine, but the logic is wrong:
// This "bank transfer" decrements sender and increments receiver
// in separate lock acquisitions, creating a window where funds vanish.
use std::sync::{Arc, Mutex};
let sender_balance   = Arc::new(Mutex::new(100));
let receiver_balance = Arc::new(Mutex::new(50));

*sender_balance.lock().unwrap() -= 30;
// &lt;--- another thread could observe "sender lost 30 but receiver hasn't gained yet"
*receiver_balance.lock().unwrap() += 30;</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Correct: hold both locks simultaneously for an atomic transfer
use std::sync::{Arc, Mutex};
let sender   = Arc::new(Mutex::new(100));
let receiver = Arc::new(Mutex::new(50));

// Lock both at once so no thread sees the in-between state
{
    let mut s = sender.lock().unwrap();
    let mut r = receiver.lock().unwrap();
    *s -= 30;
    *r += 30;
} // both released here</code></pre>
</div>

<h3>Mistake 3: Spawning unbounded threads</h3>

<p>Spawning one thread per item in a large collection creates thousands of threads. Each OS thread has overhead (typically 8 MB of stack space by default). Use a thread pool or a bounded queue pattern instead.</p>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Dangerous for large collections: spawns one thread per item
let items: Vec&lt;i32&gt; = (0..10_000).collect();
for item in items {
    std::thread::spawn(move || println!("{}", item)); // 10,000 threads!
}</code></pre>
</div>

<div class="code-block-wrapper">
  <span class="code-lang-label">rust</span>
  <pre><code class="language-rust">// Better: use a fixed-size pool (channels + bounded workers, as shown above)
// or a crate like rayon for data-parallel work.
// The mini thread pool example earlier in this chapter is a good template.</code></pre>
</div>
`
  },

});
