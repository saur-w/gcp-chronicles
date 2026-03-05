import { useState } from "react";

// ═══════════════════════════════════════════════════════════
// CHARACTERS
// ═══════════════════════════════════════════════════════════
const CHARACTERS = [
  { id: "kassandra", name: "Kassandra", origin: "Ancient Greece", emoji: "⚔️", color: "#c9a84c", accent: "#ffd700", desc: "Misthios of Sparta. Walks between worlds. Fears nothing.", art: "🏛️" },
  { id: "aloy", name: "Aloy", origin: "The Frontier", emoji: "🏹", color: "#e8833a", accent: "#ff9f55", desc: "Seeker of truths. Master of ancient machines.", art: "🌿" },
  { id: "eivor", name: "Eivor", origin: "Norway", emoji: "🪓", color: "#6b9fd4", accent: "#8fc0f0", desc: "Viking shieldmaiden. Conqueror of kingdoms.", art: "⚡" },
  { id: "zelda", name: "Zelda", origin: "Hyrule", emoji: "✨", color: "#9b72cf", accent: "#c4a7e7", desc: "Princess. Sage. Keeper of ancient wisdom.", art: "🔮" },
  { id: "custom", name: "Custom", origin: "Your World", emoji: "🌟", color: "#4ade80", accent: "#86efac", desc: "Write your own legend.", art: "🌟" },
];

// ═══════════════════════════════════════════════════════════
// WORLD DATA — 5 Cities in the Scorpio Sky
// ═══════════════════════════════════════════════════════════
const CITIES = [
  {
    id: "bigquery",
    name: "Querythas",
    subtitle: "The Crystal Warehouse",
    emoji: "🏰",
    color: "#4A90E2",
    glow: "#4A90E230",
    domain: "BigQuery — Storage & Optimization",
    bossName: "The Cost Dragon",
    bossEmoji: "🐉",
    bossDesc: "An ancient beast that devours gold with every unoptimized query.",
    locked: false,
    lessons: [
      {
        id: "bq-1",
        title: "Partitioning vs Clustering",
        icon: "📦",
        concept: "How to organize data to save gold (money)",
        keyPoints: [
          { label: "Partitioning", text: "Physically divides table into segments by date/time. BigQuery skips entire partitions — like locking castle wings you don't need." },
          { label: "Clustering", text: "Sorts data within partitions by up to 4 columns. Orders from LOWEST to HIGHEST cardinality (state → city → store_id)." },
          { label: "Use both!", text: "Partition by date + cluster by your filter columns = maximum cost savings and query speed." },
          { label: "⚠️ Rule", text: "BigQuery only allows ONE partition column per table. No multi-column partitioning!" },
        ],
        analogy: "Imagine a medieval archive: Partitioning = separate rooms per year. Clustering = inside each room, scrolls sorted by topic then by author. You only enter the room you need, and find the scroll instantly.",
        tip: "Always filter on the partition column in your WHERE clause, or you pay for a full table scan!",
      },
      {
        id: "bq-2",
        title: "Materialized Views vs BI Engine",
        icon: "⚡",
        concept: "Pre-computing answers to save time and gold",
        keyPoints: [
          { label: "Materialized Views", text: "Pre-aggregate data physically. Refreshed incrementally as source changes. Best for repeated aggregation queries on large tables (TBs)." },
          { label: "BI Engine", text: "In-memory cache for small dimension tables. Great for dashboards with fast-changing small datasets. Won't hold a 50TB fact table." },
          { label: "Authorized Views", text: "Access control only — they DON'T improve performance. They just hide data from unauthorized users." },
          { label: "When to use what", text: "Large table + repeated aggregations → Materialized View. Small table + concurrent BI users → BI Engine. Sharing data securely → Analytics Hub or Authorized Views." },
        ],
        analogy: "The palace scribe pre-calculates the kingdom's tax totals every night so the king doesn't wait 10 minutes every morning. That's a Materialized View. BI Engine is the king's personal aide who memorizes the most-asked questions.",
        tip: "On the exam: if they say 'reduce response time, lower costs, minimize maintenance' for a large aggregated table → Materialized Views is almost always the answer.",
      },
      {
        id: "bq-3",
        title: "Security & Sharing Data",
        icon: "🔐",
        concept: "Who can see what, and how to share without duplicating",
        keyPoints: [
          { label: "Analytics Hub", text: "Publish datasets once. Other teams SUBSCRIBE — no data duplication. Creates authorized dataset automatically at subscription time." },
          { label: "CMEK (Customer-Managed Encryption Keys)", text: "You control the encryption key in Cloud KMS. If key is compromised: create new key + new bucket with CMEK default + copy all objects." },
          { label: "Cloud EKM", text: "Key stays on YOUR on-premises HSM, never exported to Google. Link to Cloud KMS reference → associate with BigQuery." },
          { label: "Cloud DLP", text: "De-identify PII before loading. Use CryptoDeterministicConfig (FFX) for deterministic tokenization — preserves join ability across datasets." },
        ],
        analogy: "Analytics Hub is the royal library: books are published once, any guild can subscribe to read copies. No need to print the whole book for each guild! EKM is like keeping the master key in your own vault but letting Google's door use a copy of the lock shape.",
        tip: "Exam trap: bigquery.jobUser role lets users RUN jobs, but does NOT grant access to data. For data access, you need bigquery.dataViewer or higher.",
      },
    ],
    questions: [
      { text: "You need to query a 10TB transactions table, filtering by the last 30 days, grouped by state, city, and store. How should you structure the table?", analogy: "🐉 The Cost Dragon is watching every byte you scan!", options: ["Partition by transaction_time; cluster by state → city → store_id", "Partition by transaction_time; cluster by store_id → city → state", "Cluster only by state → city → store_id (no partition)", "Cluster only by store_id → city → state (no partition)"], correct: 0, explanation: "Partition by time (prunes old data from scans) + cluster from LOW to HIGH cardinality (state→city→store_id) matches the most common filter patterns. Reverse clustering order reduces pruning efficiency." },
      { text: "Your BI tool runs hundreds of queries daily aggregating a 50TB sales table. Queries are slow and expensive. Minimize response time, cost, and maintenance.", analogy: "🐉 The dragon charges gold per byte scanned. Pre-cook your answers!", options: ["Build materialized views with day and month aggregations", "Build authorized views with day and month aggregations", "Enable BI Engine and add the sales table as preferred table", "Create a scheduled query to build aggregate tables hourly"], correct: 0, explanation: "Materialized views physically pre-aggregate data. BI Engine caches small dimension tables (won't hold 50TB). Authorized views are for access control, not performance. Scheduled queries have lag and cost." },
      { text: "Multiple teams need access to centralized customer data in BigQuery. You want to minimize data duplication and operational overhead.", options: ["Ask each team to create authorized views. Grant bigquery.jobUser role.", "Publish data in BigQuery Analytics Hub. Direct teams to subscribe.", "Create a scheduled query to replicate customer data into each team project.", "Enable each team to create materialized views of the data they need."], correct: 1, explanation: "Analytics Hub creates an authorized dataset automatically at subscription time — zero duplication! bigquery.jobUser doesn't grant data access. Replicating data increases cost and maintenance." },
      { text: "A Cloud KMS key protecting your Cloud Storage data was compromised. Re-encrypt all data, delete the old key, and reduce risk of future objects without CMEK. What do you do?", options: ["Rotate the Cloud KMS key version. Continue using the same bucket.", "Create new KMS key. Set as default CMEK on the existing bucket.", "Create new KMS key. New bucket. Copy objects specifying the new key in the copy command.", "Create new KMS key. New bucket with new key as default CMEK. Copy objects WITHOUT specifying a key."], correct: 3, explanation: "New bucket with default CMEK ensures ALL objects written to it (including copies) are protected automatically. Rotating doesn't re-encrypt existing data. Setting default on old bucket only protects future writes." },
      { text: "You need to run SQL analytics on Cloud SQL data from BigQuery with minimum load on Cloud SQL. What approach do you use?", options: ["Migrate Cloud SQL data to BigQuery with Data Transfer Service", "Use BigQuery federated queries with Cloud SQL connector", "Create a Dataflow pipeline that reads Cloud SQL and writes to BigQuery periodically", "Use Serverless Spark to query BigQuery and Cloud SQL together"], correct: 1, explanation: "Federated queries let BigQuery query Cloud SQL directly via SQL with pushdown optimization — BigQuery sends the filter to Cloud SQL, minimizing load. Serverless Spark doesn't do efficient pushdown and uses high compute units." },
    ],
  },
  {
    id: "dataflow",
    name: "Streamhaven",
    subtitle: "The River City",
    emoji: "🌊",
    color: "#00C9A7",
    glow: "#00C9A730",
    domain: "Dataflow — Processing & Streaming",
    bossName: "The Watermark Hydra",
    bossEmoji: "🐍",
    bossDesc: "A many-headed beast — cut one delay and two more appear.",
    locked: true,
    lessons: [
      {
        id: "df-1",
        title: "Streaming vs Batch Processing",
        icon: "🌊",
        concept: "When to process data in real-time vs in chunks",
        keyPoints: [
          { label: "Batch (Dataflow)", text: "Process bounded datasets on a schedule. Good for ETL, historical analysis. Higher latency, lower cost." },
          { label: "Streaming (Dataflow)", text: "Process unbounded streams continuously. Use for real-time analytics, fraud detection, IoT. Apache Beam model." },
          { label: "Pub/Sub + Dataflow", text: "The golden combo: Pub/Sub buffers and scales ingestion; Dataflow processes with windowing, watermarks, and state." },
          { label: "Dataproc vs Dataflow", text: "Dataproc = managed Spark/Hadoop (bring your own code). Dataflow = fully serverless, autoscaling, Apache Beam managed service." },
        ],
        analogy: "Batch is harvesting grain once a year. Streaming is a water mill running 24/7. Dataflow is the mill — you tell it how to grind (your Beam pipeline), it handles water levels (autoscaling) automatically.",
        tip: "Exam key: 'serverless', 'autoscaling', 'streaming with windows' → Dataflow. 'Existing Spark/Hadoop jobs', 'Hive' → Dataproc.",
      },
      {
        id: "df-2",
        title: "Windows, Watermarks & Late Data",
        icon: "⏱️",
        concept: "Grouping streaming events by time",
        keyPoints: [
          { label: "Tumbling Windows (Fixed)", text: "Non-overlapping time windows. e.g., hourly aggregations. FixedWindows(Duration.standardHours(1))" },
          { label: "Sliding Windows", text: "Overlapping windows. e.g., 'last 30 minutes, calculated every 5 minutes'." },
          { label: "Watermarks", text: "A timestamp estimating 'how far behind' the pipeline is. Triggers when to close a window and emit results." },
          { label: "AllowedLateness", text: "How long to wait for late-arriving events after the watermark. Late data outside this window is dropped." },
        ],
        analogy: "Imagine collecting rain in buckets per hour (tumbling window). The watermark is your assistant telling you 'I think all rain from 3pm is in the bucket now'. AllowedLateness = 'wait 5 more minutes just in case'.",
        tip: "For 'aggregate events over hourly intervals from Pub/Sub' → always Dataflow streaming with tumbling windows. Cloud Functions CAN'T aggregate across time natively.",
      },
      {
        id: "df-3",
        title: "Dataflow Operations & Optimization",
        icon: "🔧",
        concept: "Running, updating, and debugging pipelines",
        keyPoints: [
          { label: "Job Update (Zero Downtime)", text: "Dataflow supports in-place job updates. Replace running pipeline with new version, state is preserved. No restart needed." },
          { label: "Reshuffle", text: "Insert after merged steps to force Dataflow to separate them again — allows individual step metrics for bottleneck identification." },
          { label: "Streaming Engine", text: "Moves window state off worker VMs to a managed backend. Reduces worker memory needs. Enable for large-scale streaming." },
          { label: "Autoscaling", text: "Dataflow automatically adjusts worker count. Monitor via Dataflow console job graph + step metrics." },
        ],
        analogy: "Job Update is like a ship crew changing sails mid-ocean without stopping. Reshuffle is like forcing separate inspection checkpoints in an assembly line so you can see exactly which station is slow.",
        tip: "Bottleneck identification: use Reshuffle to separate merged steps, then monitor per-step metrics in the Dataflow console. NOT logs — logs show errors, not throughput bottlenecks.",
      },
    ],
    questions: [
      { text: "A Dataflow streaming pipeline is processing slowly. The job graph was automatically merged into one step. How do you identify the bottleneck?", analogy: "🐍 The Hydra hides inside fused steps — you need to reveal her heads!", options: ["Check Cloud Logging for error messages on workers", "Insert a Reshuffle after each processing step; monitor execution details in the Dataflow console", "Increase the number of Dataflow workers", "Restart the job with more memory"], correct: 1, explanation: "Reshuffle prevents step fusion, making Dataflow show individual step metrics. The Dataflow console then reveals which step has the backlog. Logs show errors, not performance bottlenecks. Scaling workers without knowing the bottleneck may not help." },
      { text: "You need to process events from Pub/Sub and aggregate over hourly intervals before loading to BigQuery. High event volume, must scale. What technology?", options: ["Cloud Function triggered by Pub/Sub per message", "Cloud Function scheduled hourly to pull Pub/Sub messages", "Dataflow batch job scheduled hourly", "Dataflow streaming job with tumbling windows of 1 hour"], correct: 3, explanation: "Dataflow streaming with FixedWindows(1h) is the only solution that: auto-scales horizontally, handles late data (allowedLateness), processes continuously (no batch lag), and writes aggregated results directly to BigQuery. Cloud Functions can't aggregate across time without external state." },
      { text: "You developed a new Dataflow pipeline version (reading Pub/Sub → writing BigQuery). Current version uses 5-min windows and is in production. Deploy with zero downtime.", options: ["Stop the old job, wait for backlog to drain, start new job", "Use Dataflow job update to replace the running job", "Run new job in parallel, stop old one when new one stabilizes", "Use Cloud Composer to orchestrate the swap"], correct: 1, explanation: "Dataflow job update replaces the running job in-place, preserving worker state and not interrupting Pub/Sub processing. Stopping causes downtime. Running in parallel risks duplicate data in BigQuery." },
      { text: "Pipeline must auto-scale with load, process each message at least once, and order messages within 1-hour windows. Which combination?", options: ["Apache Kafka + Cloud Dataproc", "Apache Kafka + Cloud Dataflow", "Cloud Pub/Sub + Cloud Dataproc", "Cloud Pub/Sub + Cloud Dataflow"], correct: 3, explanation: "Pub/Sub = serverless, auto-scaling ingestion. Dataflow = at-least-once semantics, 1h tumbling windows in event time, ordering by key, autoscaling. Kafka requires manual cluster management. Dataproc lacks native streaming windowing primitives." },
    ],
  },
  {
    id: "pubsub",
    name: "Signaltower",
    subtitle: "The Messenger City",
    emoji: "📡",
    color: "#F7C948",
    glow: "#F7C94830",
    domain: "Pub/Sub — Ingestion & Messaging",
    bossName: "The Ghost of Lost Messages",
    bossEmoji: "👻",
    bossDesc: "Messages that vanish in transit, never acknowledged, forever retried.",
    locked: true,
    lessons: [
      {
        id: "ps-1",
        title: "Pub/Sub Core Concepts",
        icon: "📨",
        concept: "How the messaging system works",
        keyPoints: [
          { label: "Topics & Subscriptions", text: "Publishers send to Topics. Subscribers pull from Subscriptions. Decoupled: many publishers, many subscribers." },
          { label: "At-least-once delivery", text: "Pub/Sub guarantees each message is delivered at least once. Your consumer must be idempotent to handle duplicates." },
          { label: "Dead Letter Queue (DLQ)", text: "Messages that fail after max retries go to a dead-letter topic. Critical for catching processing errors without losing data." },
          { label: "Ordering Keys", text: "Messages with the same ordering key are delivered in order within that key. Useful for per-entity ordering." },
        ],
        analogy: "Pub/Sub is like a medieval postal system: your letter (message) goes to a central post office (topic). Any number of guilds (subscribers) can have a mailbox. The system guarantees delivery — if the messenger fails, they try again. DLQ = letters that couldn't be delivered go to a special drawer.",
        tip: "Pub/Sub ordering: messages with the same ordering key are in order. BUT ordering keys reduce parallelism. Only use when truly needed.",
      },
      {
        id: "ps-2",
        title: "Pub/Sub + Dataflow Patterns",
        icon: "🔗",
        concept: "Common architectures on the exam",
        keyPoints: [
          { label: "Pub/Sub → Dataflow → BigQuery", text: "The most common streaming pattern. Pub/Sub ingests; Dataflow transforms, validates, aggregates; BigQuery stores for analytics." },
          { label: "Pub/Sub → BigQuery Direct", text: "For simple no-transform scenarios. Pub/Sub has a native BigQuery subscription — no code needed." },
          { label: "Pub/Sub → Cloud Storage (Archive)", text: "For raw data archiving. Dataflow writes to both BigQuery (analytics) and Cloud Storage (long-term, cost-efficient)." },
          { label: "DLQ Pattern", text: "Dataflow routes invalid/failed records to a dead-letter Pub/Sub topic for manual review or reprocessing." },
        ],
        analogy: "Think of it as an assembly line: Pub/Sub is the loading dock (receives all raw materials). Dataflow is the factory floor (cleans, sorts, transforms). BigQuery is the warehouse (ready for use). Cloud Storage is the archive room (keep everything forever, cheaply).",
        tip: "For 'decouple producers and consumers + near real-time SQL + cost-efficient raw storage' → Pub/Sub + Dataflow → BigQuery + Cloud Storage (in Avro format).",
      },
      {
        id: "ps-3",
        title: "Security & Change Data Capture",
        icon: "🔒",
        concept: "Securing Pub/Sub and migrating operational data",
        keyPoints: [
          { label: "VPC Service Controls", text: "Creates a security perimeter around a PROJECT (not VPC). Prevents data exfiltration from Pub/Sub to other projects. Pub/Sub is serverless — firewall rules have no effect on it." },
          { label: "Why not IAM Conditions?", text: "IAM conditions don't support project_id in Pub/Sub. Users don't 'belong' to projects. VPC-SC is the correct tool." },
          { label: "Datastream (CDC)", text: "Serverless Change Data Capture service. Replicates from Oracle/MySQL/PostgreSQL to BigQuery continuously. No VMs to manage." },
          { label: "Kafka vs Pub/Sub", text: "Kafka requires VM clusters (Zookeeper, brokers). Pub/Sub is fully managed. Exam prefers Pub/Sub when 'minimize infrastructure management' is a requirement." },
        ],
        analogy: "VPC Service Controls is like a magical forcefield around the kingdom that blocks any message from leaving — even if someone inside wanted to share secrets with the neighboring kingdom. Firewalls only block the gates, but wizards (serverless services) teleport over walls.",
        tip: "Datastream = serverless CDC. Debezium/Kafka Connect = requires VMs. When the exam says 'minimize infrastructure management' for CDC → Datastream wins.",
      },
    ],
    questions: [
      { text: "Project A has a Pub/Sub topic with confidential data. You need to ensure Project B and all future projects cannot access it. What do you do?", analogy: "👻 The ghost is leaking secrets to neighboring kingdoms!", options: ["Configure VPC Service Controls with a perimeter around Project A", "Configure VPC Service Controls with a perimeter around the VPC of Project A", "Add firewall rules in Project A to allow only Project A VPC traffic", "Use IAM conditions so only Project A users access Project A resources"], correct: 0, explanation: "VPC-SC creates a perimeter around the PROJECT and supports Pub/Sub. Firewall rules and VPC perimeters don't affect serverless services. IAM conditions don't support project_id in Pub/Sub." },
      { text: "Your app generates 150 GB/day of JSON (growing). Requirements: decouple producers/consumers, raw storage indefinitely (cost-efficient), near real-time SQL, 2+ years SQL-accessible history.", options: ["API + polling tool → Cloud Storage as gzipped JSON", "Write to Cloud SQL + periodic exports to Cloud Storage and BigQuery", "Pub/Sub + Spark on Dataproc → Avro on HDFS on Persistent Disk", "Pub/Sub + Dataflow that transforms JSON→Avro → Cloud Storage AND BigQuery"], correct: 3, explanation: "Pub/Sub decouples. Dataflow transforms JSON→Avro (compact + schema). Dual write: Cloud Storage (indefinite cheap archive) + BigQuery (SQL, near real-time, 2yr history). HDFS on PD is expensive. Cloud SQL doesn't scale for analytics." },
      { text: "You need to replicate and continuously sync 50 Oracle tables (on a VM in a VPC) to BigQuery, minimizing infrastructure management.", options: ["Deploy Kafka in the VPC + Kafka Connect Oracle CDC + BigQuery Sink Connector", "Deploy Kafka in the VPC + Kafka Connect Oracle CDC + Dataflow to BigQuery", "Create a Datastream service Oracle→BigQuery with private connectivity to the VPC", "Pub/Sub subscription + Debezium Oracle connector to capture changes"], correct: 2, explanation: "Datastream is a serverless CDC service — no VMs to manage! Private connectivity reaches the Oracle VM in the VPC. Kafka requires VM clusters. Debezium needs a VM. Serverless = minimum infrastructure." },
    ],
  },
  {
    id: "storage",
    name: "The Vault",
    subtitle: "City of Storage Secrets",
    emoji: "🗝️",
    color: "#E05C5C",
    glow: "#E05C5C30",
    domain: "Storage & Security — IAM, Bigtable, Spanner",
    bossName: "The Permission Thief",
    bossEmoji: "🦹",
    bossDesc: "Steals access when you least expect it. Over-permissions are its weapon.",
    locked: true,
    lessons: [
      {
        id: "st-1",
        title: "Choosing the Right Storage",
        icon: "🗄️",
        concept: "Which GCP storage service for which use case",
        keyPoints: [
          { label: "BigQuery", text: "Analytics warehouse. Petabyte scale. SQL. High latency per single row. NOT for <100ms serving." },
          { label: "Bigtable", text: "NoSQL wide-column. Millisecond latency. Millions of reads/writes/sec. For time-series, IoT, serving ML predictions. Row key design is CRITICAL." },
          { label: "Cloud SQL", text: "Managed relational (MySQL/PostgreSQL). For transactional OLTP. Limited scale vs Spanner." },
          { label: "Cloud Spanner", text: "Globally distributed relational. ACID transactions at scale. For global OLTP. More expensive than Cloud SQL." },
        ],
        analogy: "BigQuery = the royal archives (great for research, slow to fetch one scroll). Bigtable = the speed courier post (instant delivery, organized by recipient name). Cloud SQL = the village accountant (reliable, limited scale). Spanner = the empire-wide treasury (global, always consistent, expensive).",
        tip: "Exam pattern: 'serve ML predictions with <100ms latency' → Bigtable (NOT BigQuery). 'Global ACID transactions' → Spanner. 'PostgreSQL compatibility, minimize cost' → Cloud SQL.",
      },
      {
        id: "st-2",
        title: "Bigtable Row Key Design",
        icon: "🔑",
        concept: "The most important concept in Bigtable — gets its own lesson!",
        keyPoints: [
          { label: "Hotspotting", text: "If row keys are monotonically increasing (like timestamps), all writes go to ONE tablet server → performance bottleneck." },
          { label: "Fix: Reverse timestamps", text: "Use reversed timestamps so recent data doesn't cluster at the same end. Or use symbol/entity as key prefix." },
          { label: "Rule: High-cardinality prefix", text: "Start keys with the entity you query most (stock symbol, user_id). Then timestamp. e.g., AAPL#1234567890" },
          { label: "Salt/Hash", text: "For 'hot' keys, add a random prefix (salting) to distribute writes across tablets." },
        ],
        analogy: "If you organize a library by 'date added' — all TODAY's books pile up at one librarian's desk. Chaos! Instead, sort by AUTHOR first, then date. Each librarian gets an equal share. That's why Bigtable wants entity+timestamp, not just timestamp.",
        tip: "Classic exam trap: 'datetime as the start of the row key causes performance degradation with thousands of users' → ALWAYS change to start with the entity identifier (stock symbol, user_id, etc.).",
      },
      {
        id: "st-3",
        title: "IAM & Encryption",
        icon: "🛡️",
        concept: "Securing data in GCP",
        keyPoints: [
          { label: "Principle of Least Privilege", text: "Grant minimum permissions needed. bigquery.dataViewer (read only) vs bigquery.dataEditor vs bigquery.admin." },
          { label: "CMEK vs CSEK vs EKM", text: "CMEK = key in Cloud KMS (Google-managed infra). CSEK = you provide key per request. EKM = key stays on YOUR external HSM, never leaves." },
          { label: "Cloud DLP", text: "Detect and de-identify PII. Use CryptoDeterministicConfig for tokenization that preserves JOIN capability across datasets." },
          { label: "VPC Service Controls", text: "Security perimeter around projects. Prevents data exfiltration for supported services (BigQuery, Pub/Sub, GCS, etc.)." },
        ],
        analogy: "EKM is like a hotel that lets you use your own padlock — the hotel staff can open your room door shape, but the actual key that unlocks it never leaves your keychain. The key material NEVER goes to Google.",
        tip: "For PII across multiple datasets that needs JOIN: CryptoDeterministicConfig (format-preserving, deterministic). For irreversible anonymization: CryptoHashConfig. For display-only masking: BigQuery Dynamic Data Masking.",
      },
    ],
    questions: [
      { text: "You have a BigQuery ML model. An application needs to serve predictions per user_id with <100ms latency. What's your architecture?", analogy: "🦹 The thief is slow — and BigQuery latency will steal your SLA!", options: ["Add WHERE user_id=? filter in BigQuery ML query. Grant BigQuery Data Viewer.", "Create an authorized view. Share the dataset with the app service account.", "Dataflow pipeline reads BigQuery ML results. Grant Dataflow Worker role to app.", "Dataflow reads predictions from BigQuery ML → writes to Bigtable (user_id as row key) → app reads from Bigtable with Bigtable Reader role."], correct: 3, explanation: "BigQuery latency (planning + slots + cold cache) regularly exceeds 100ms for single-row lookups. Pre-compute predictions with Dataflow, store in Bigtable (user_id as row key = O(1) lookups <10ms), app reads from Bigtable. Decouple inference from serving." },
      { text: "Store stock trade data in Bigtable. Datetime is the start of the row key. Thousands of concurrent users. Performance degrades as more data is added. Fix it.", options: ["Change row key to start with stock symbol", "Change row key to start with a random number per second", "Migrate data to BigQuery instead", "Add more Bigtable nodes"], correct: 0, explanation: "Datetime-as-key causes hotspotting: all recent writes land on one tablet server. Starting with stock symbol distributes writes across symbols (high cardinality prefix). Random-per-second works but loses query ability. More nodes help temporarily but don't fix the design." },
      { text: "You must encrypt BigQuery data with a key generated and stored ONLY on your on-premises HSM. Use Google-managed solutions. What do you do?", options: ["Create key in on-prem HSM, import into Cloud KMS. Associate with BigQuery.", "Create key in on-prem HSM, import into Cloud HSM. Associate with BigQuery.", "Create key in on-prem HSM, link to Cloud External Key Manager (EKM). Associate the Cloud KMS key with BigQuery.", "Create key in on-prem HSM. Encrypt data before ingesting into BigQuery."], correct: 2, explanation: "Cloud EKM keeps the key material on YOUR HSM — it never moves to Google infrastructure. You link it via Cloud KMS reference and associate with BigQuery. Importing to Cloud KMS/HSM MOVES the key to Google's infrastructure, violating the 'only on-prem HSM' requirement." },
    ],
  },
  {
    id: "composer",
    name: "Pipeforge",
    subtitle: "The Automation Citadel",
    emoji: "⚙️",
    color: "#A259FF",
    glow: "#A259FF30",
    domain: "Cloud Composer, Dataproc & Automation",
    bossName: "The Broken Pipeline Golem",
    bossEmoji: "🤖",
    bossDesc: "A construct built from failed DAGs and unmonitored jobs. It never stops.",
    locked: true,
    lessons: [
      {
        id: "cp-1",
        title: "Cloud Composer & Airflow DAGs",
        icon: "🎼",
        concept: "Orchestrating complex data pipelines",
        keyPoints: [
          { label: "DAG (Directed Acyclic Graph)", text: "A workflow definition in Airflow/Composer. Defines tasks and dependencies. No cycles allowed." },
          { label: "BigQueryInsertJobOperator", text: "The correct operator to run SQL queries on BigQuery from Composer. Supports retry and email_on_failure." },
          { label: "BigQueryUpsertTableOperator", text: "For creating/updating table PROPERTIES (schema, metadata). NOT for running queries." },
          { label: "Key parameters", text: "retry=3 (try 3 times), email_on_failure=True (send email if all retries fail). Set on the operator level." },
        ],
        analogy: "A DAG is like a cooking recipe for the kingdom's feast: first gather ingredients (task 1), then prep (task 2), then cook (task 3). If one step fails, retry up to 3 times. If all fail, send a raven (email) to the chef.",
        tip: "Exam trap: BigQuery Scheduled Queries have NO retry options. For retry + email_on_failure → must use Cloud Composer with BigQueryInsertJobOperator.",
      },
      {
        id: "cp-2",
        title: "Dataproc — Managed Spark & Hadoop",
        icon: "⚡",
        concept: "When to use Dataproc vs other options",
        keyPoints: [
          { label: "Dataproc strengths", text: "Managed Spark/Hadoop. Lift-and-shift existing jobs. Faster cluster spin-up than on-prem. Integrates with GCS connector." },
          { label: "Ephemeral vs Persistent clusters", text: "Ephemeral: spin up for a job, then shut down (cost-efficient). Persistent: for frequent, short interactive jobs." },
          { label: "I/O intensive jobs", text: "For disk I/O intensive Hadoop jobs on Dataproc: store intermediate data on NATIVE HDFS (Persistent Disk), not Cloud Storage. GCS adds network latency." },
          { label: "When NOT Dataproc", text: "For serverless, no-code pipelines → Dataflow. For SQL transformations → BigQuery. For simple scheduled jobs → Cloud Composer + BigQuery." },
        ],
        analogy: "Dataproc is like renting a forge crew that knows how to work YOUR existing tools. Cloud Storage connector is great for the final materials warehouse, but for hot intermediate metalwork — keep it at the local forge (native HDFS) for speed.",
        tip: "I/O intensive Hadoop job slower on Dataproc than on-prem? → Allocate more Persistent Disk, store intermediate data on local HDFS. Network latency to GCS is the culprit.",
      },
      {
        id: "cp-3",
        title: "Data Governance & Migration",
        icon: "🗺️",
        concept: "Managing data at scale and moving data to GCP",
        keyPoints: [
          { label: "Dataplex", text: "Unified data governance layer. Manages data WHERE IT IS (no migration). Auto-discovery, data lineage, quality validation. Decentralized data mesh." },
          { label: "Transfer Appliance", text: "Physical device for transferring 1 PB+ to GCP in hours/days. When internet bandwidth would take weeks." },
          { label: "Database Migration Service", text: "For migrating databases (MySQL, PostgreSQL, SQL Server, Oracle) to Cloud SQL or AlloyDB." },
          { label: "Datastream", text: "Serverless CDC for ongoing replication. Not one-time migration — continuous sync from Oracle/MySQL/PostgreSQL." },
        ],
        analogy: "Dataplex is a royal cartographer who maps all the kingdom's treasures (data) without moving them — just creates a master catalog. Transfer Appliance is shipping a chest of gold by armored carriage (physical device) instead of couriering coins one by one (internet).",
        tip: "1 PB migration in 'a few hours' → Transfer Appliance. Ongoing CDC replication with minimum infra → Datastream. Data discovery + lineage + quality in one place → Dataplex.",
      },
    ],
    questions: [
      { text: "You need to run a SQL transformation on BigQuery with up to 3 retries and email notification if all fail. What solution?", analogy: "🤖 The Golem breaks every pipe. You need an engineer who tries 3 times before calling for help!", options: ["BigQuery scheduled query with Pub/Sub notification after failure", "BigQueryUpsertTableOperator in Cloud Composer, retry=3, email_on_failure=True", "BigQuery scheduled query + Cloud Run function to send email after 3 failures", "BigQueryInsertJobOperator in Cloud Composer, retry=3, email_on_failure=True"], correct: 3, explanation: "BigQueryInsertJobOperator runs SQL transformations in BigQuery. With retry=3 and email_on_failure=True, it retries 3 times then sends email. BigQuery scheduled queries have NO retry options. BigQueryUpsertTableOperator is for table schema/properties, not query execution." },
      { text: "You need to migrate 1 PB of data from an on-premises datacenter to Google Cloud. Migration must complete in a few hours with a secure connection. Best practice?", options: ["gsutil with parallel upload over the internet", "Cloud VPN + Storage Transfer Service", "Transfer Appliance", "Dedicated Interconnect + gsutil"], correct: 2, explanation: "Transfer Appliance is a physical device for large-scale data transfer (hundreds of TBs to PBs) in hours. Uploading 1 PB over internet would take weeks even with Dedicated Interconnect. Transfer Appliance is Google's recommended practice for this scale and time constraint." },
      { text: "A disk I/O intensive Hadoop job runs significantly slower on Cloud Dataproc than on bare-metal (8 cores, 100GB RAM). You're using Cloud Storage connector. Fix?", options: ["Allocate more memory so intermediate data stays in RAM", "Allocate more Persistent Disk; store intermediate data on native HDFS", "Allocate more CPU cores to increase network bandwidth per instance", "Switch all data to Cloud Storage connector for all operations"], correct: 1, explanation: "I/O intensive jobs are penalized by Cloud Storage network latency. Storing intermediate data on local HDFS (Persistent Disk) eliminates network round-trips. Input/output data can stay on GCS (for separation of storage/compute), but intermediate data needs local disk." },
      { text: "Healthcare data is spread across various storage services managed by different owners. Discovery and management is difficult. Need: data discovery, lineage tracking, quality validation. Cost-optimized.", options: ["Build a custom data discovery tool on GKE", "Use BigLake to convert everything to a data lake", "Use Dataplex to manage data, track lineage, and perform quality validation", "Use BigQuery for lineage tracking and Dataprep for data management and quality"], correct: 2, explanation: "Dataplex manages data WHERE IT LIVES (no migration required). It automates discovery, tracks lineage, and validates quality — all in one managed service. GKE custom tool is time-consuming and expensive. BigLake conversion is disruptive. BigQuery+Dataprep doesn't cover end-to-end lineage." },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════
const XP_LESSON = 50;
const XP_CORRECT = 100;
const XP_WRONG = 15;

function Stars() {
  const s = Array.from({ length: 100 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    sz: Math.random() * 2 + 0.3, d: Math.random() * 5, dur: 2 + Math.random() * 4,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {s.map(({ id, x, y, sz, d, dur }) => (
        <div key={id} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: sz, height: sz, borderRadius: "50%", background: "#fff", animation: `twkl ${dur}s ${d}s infinite alternate` }} />
      ))}
      {/* Nebula clouds */}
      <div style={{ position: "absolute", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, #0d1b4e44 0%, transparent 70%)", top: "10%", left: "60%", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, #1a0d3a44 0%, transparent 70%)", bottom: "20%", left: "10%", filter: "blur(60px)" }} />
    </div>
  );
}

function XPBar({ xp, level }) {
  const needed = level * 500;
  const cur = xp % needed;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "#F7C948", fontSize: 11, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>Lv.{level}</span>
      <div style={{ flex: 1, height: 6, background: "#0a0f1e", borderRadius: 99, overflow: "hidden", border: "1px solid #1a2040" }}>
        <div style={{ height: "100%", width: `${(cur / needed) * 100}%`, background: "linear-gradient(90deg, #F7C948, #f97316)", borderRadius: 99, transition: "width 0.8s ease", boxShadow: "0 0 8px #F7C94866" }} />
      </div>
      <span style={{ color: "#374151", fontSize: 10, fontFamily: "monospace" }}>{xp}xp</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════
function CharacterSelect({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [customName, setCustomName] = useState("");
  const [selected, setSelected] = useState(null);

  const handlePick = (c) => {
    if (c.id === "custom" && !customName.trim()) return;
    const name = c.id === "custom" ? customName.trim() : c.name;
    onSelect({ ...c, name });
  };

  return (
    <div style={{ animation: "fadeUp 0.6s ease", maxWidth: 860, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#374151", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>✦ WHO WALKS THE SCORPIO SKY? ✦</div>
        <h2 style={{ fontSize: "clamp(20px,4vw,34px)", fontWeight: 800, color: "#e5e7eb", letterSpacing: 2, marginBottom: 8 }}>CHOOSE YOUR HERO</h2>
        <p style={{ color: "#4b5563", fontSize: 13, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Five sky-cities float above Scorpio's constellation. Only a true Data Architect can unlock their secrets.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
        {CHARACTERS.map(c => {
          const active = hovered === c.id || selected === c.id;
          return (
            <div key={c.id} onClick={() => setSelected(c.id)}
              onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              style={{
                borderRadius: 20, padding: "24px 16px", textAlign: "center", cursor: "pointer",
                background: active ? "rgba(17,24,39,0.98)" : "rgba(17,24,39,0.7)",
                border: `2px solid ${active ? c.color : c.color + "33"}`,
                transition: "all 0.3s", transform: active ? "translateY(-8px) scale(1.03)" : "none",
                boxShadow: active ? `0 20px 60px ${c.glow || c.color + "30"}, 0 0 40px ${c.color + "20"}` : "none",
              }}>
              <div style={{ fontSize: 44, marginBottom: 12, filter: active ? "drop-shadow(0 0 16px " + c.color + ")" : "none", transition: "all 0.3s" }}>{c.art}</div>
              <div style={{ color: active ? c.accent || c.color : c.color, fontWeight: 800, fontSize: 15, marginBottom: 4, letterSpacing: 1 }}>{c.name}</div>
              <div style={{ color: "#4b5563", fontSize: 10, marginBottom: 8, fontFamily: "monospace" }}>{c.origin}</div>
              <div style={{ color: "#374151", fontSize: 11, lineHeight: 1.5 }}>{c.desc}</div>
              {c.id === "custom" && selected === "custom" && (
                <input value={customName} onChange={e => setCustomName(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Your name..."
                  style={{ marginTop: 12, width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid ${c.color}44`, borderRadius: 8, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, outline: "none", fontFamily: "monospace" }} />
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s" }}>
          <button onClick={() => handlePick(CHARACTERS.find(c => c.id === selected))}
            style={{ padding: "16px 48px", background: `linear-gradient(135deg, ${CHARACTERS.find(c => c.id === selected)?.color}, ${CHARACTERS.find(c => c.id === selected)?.color + "aa"})`, border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: 2, boxShadow: `0 0 40px ${CHARACTERS.find(c => c.id === selected)?.color + "44"}` }}>
            BEGIN THE JOURNEY ⚔️
          </button>
        </div>
      )}
    </div>
  );
}

function WorldMap({ cities, hero, xp, level, completedLessons, completedChallenges, onCityClick }) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "#374151", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>✦ THE SCORPIO SKY CITIES ✦</div>
        <div style={{ color: hero.color, fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
          {hero.art} {hero.name}
        </div>
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <XPBar xp={xp} level={level} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20, marginBottom: 32 }}>
        {cities.map(city => {
          const lessonsComplete = city.lessons.filter(l => completedLessons.has(l.id)).length;
          const challengeDone = completedChallenges.has(city.id);
          const unlocked = !city.locked;
          const pct = city.lessons.length > 0 ? Math.round((lessonsComplete / city.lessons.length) * 100) : 0;

          return (
            <div key={city.id} onClick={() => unlocked && onCityClick(city)}
              style={{
                borderRadius: 20, padding: "24px", cursor: unlocked ? "pointer" : "not-allowed",
                background: "rgba(10,15,30,0.9)", border: `1.5px solid ${unlocked ? city.color + "55" : "#1a2040"}`,
                opacity: unlocked ? 1 : 0.4, transition: "all 0.3s", backdropFilter: "blur(10px)",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { if (unlocked) { e.currentTarget.style.borderColor = city.color; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 60px ${city.glow}`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = unlocked ? city.color + "55" : "#1a2040"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>

              {/* Progress bar at top */}
              {unlocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#0a0f1e" }}><div style={{ height: "100%", width: `${pct}%`, background: city.color, transition: "width 0.8s" }} /></div>}

              {!unlocked && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 14 }}>🔒</div>}
              {challengeDone && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 14 }}>🏆</div>}

              <div style={{ fontSize: 38, marginBottom: 12 }}>{city.emoji}</div>
              <div style={{ color: city.color, fontWeight: 800, fontSize: 16, marginBottom: 3, letterSpacing: 1 }}>{city.name}</div>
              <div style={{ color: "#374151", fontSize: 11, marginBottom: 8, fontFamily: "monospace" }}>{city.subtitle}</div>
              <div style={{ color: "#4b5563", fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{city.domain}</div>

              {unlocked && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#374151", fontSize: 10, fontFamily: "monospace" }}>STUDY TRAIL</span>
                      <span style={{ color: city.color, fontSize: 10, fontFamily: "monospace" }}>{lessonsComplete}/{city.lessons.length}</span>
                    </div>
                    <div style={{ height: 4, background: "#0a0f1e", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: city.color, borderRadius: 99, transition: "width 0.8s" }} />
                    </div>
                  </div>
                  {challengeDone
                    ? <div style={{ color: "#F7C948", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>✓ CLEARED</div>
                    : <div style={{ color: "#374151", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>BOSS AWAITS</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {[{ l: "Cities", v: cities.filter(c => !c.locked).length, c: "#F7C948" }, { l: "XP", v: xp, c: "#00C9A7" }, { l: "Level", v: `Lv.${level}`, c: "#A259FF" }].map(({ l, v, c }) => (
          <div key={l} style={{ background: `${c}0d`, border: `1px solid ${c}22`, borderRadius: 12, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ color: c, fontWeight: 800, fontSize: 20, fontFamily: "monospace" }}>{v}</div>
            <div style={{ color: "#374151", fontSize: 10 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CityView({ city, hero, completedLessons, completedChallenge, onLesson, onChallenge, onBack }) {
  const allLessonsDone = city.lessons.every(l => completedLessons.has(l.id));

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 24, fontFamily: "monospace" }}>← WORLD MAP</button>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>{city.emoji}</div>
        <h2 style={{ color: city.color, fontWeight: 800, fontSize: 26, letterSpacing: 2, marginBottom: 4 }}>{city.name}</h2>
        <div style={{ color: "#374151", fontSize: 12, fontFamily: "monospace", marginBottom: 8 }}>{city.subtitle.toUpperCase()}</div>
        <div style={{ color: "#4b5563", fontSize: 13 }}>{city.domain}</div>
      </div>

      {/* STUDY TRAIL */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ height: 1, flex: 1, background: "#1a2040" }} />
          <span style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3 }}>STUDY TRAIL</span>
          <div style={{ height: 1, flex: 1, background: "#1a2040" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {city.lessons.map((lesson, idx) => {
            const done = completedLessons.has(lesson.id);
            const prev = idx === 0 || completedLessons.has(city.lessons[idx - 1].id);
            return (
              <div key={lesson.id} onClick={() => prev && onLesson(lesson)}
                style={{
                  borderRadius: 16, padding: "18px 20px", cursor: prev ? "pointer" : "not-allowed",
                  background: "rgba(10,15,30,0.9)", border: `1.5px solid ${done ? city.color + "88" : prev ? city.color + "33" : "#1a2040"}`,
                  opacity: prev ? 1 : 0.4, transition: "all 0.3s", display: "flex", alignItems: "center", gap: 16,
                }}
                onMouseEnter={e => { if (prev) e.currentTarget.style.borderColor = city.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = done ? city.color + "88" : prev ? city.color + "33" : "#1a2040"; }}>
                <div style={{ fontSize: 28, width: 48, textAlign: "center" }}>{done ? "✅" : lesson.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: done ? city.color : "#e5e7eb", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{lesson.title}</div>
                  <div style={{ color: "#4b5563", fontSize: 12 }}>{lesson.concept}</div>
                </div>
                <div style={{ color: city.color + "88", fontSize: 11, fontFamily: "monospace" }}>
                  {done ? `+${XP_LESSON}xp ✓` : prev ? "→ EXPLORE" : "🔒"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PORTAL / BOSS */}
      <div style={{ borderRadius: 20, padding: "28px", background: "rgba(10,15,30,0.95)", border: `2px solid ${allLessonsDone ? city.color : "#1a2040"}`, opacity: allLessonsDone ? 1 : 0.5, textAlign: "center", transition: "all 0.5s", boxShadow: allLessonsDone ? `0 0 40px ${city.glow}` : "none" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{completedChallenge ? "🌟" : allLessonsDone ? city.bossEmoji : "🌀"}</div>
        <div style={{ color: allLessonsDone ? city.color : "#374151", fontWeight: 800, fontSize: 18, marginBottom: 6, letterSpacing: 1 }}>
          {completedChallenge ? "CITY CONQUERED!" : allLessonsDone ? `BOSS: ${city.bossName}` : "PORTAL SEALED"}
        </div>
        <div style={{ color: "#4b5563", fontSize: 13, marginBottom: allLessonsDone ? 20 : 0, lineHeight: 1.6 }}>
          {completedChallenge ? `${hero.name} has mastered ${city.name}. The portal to the next city glows.`
            : allLessonsDone ? city.bossDesc
            : "Complete all study lessons to unseal the portal."}
        </div>
        {allLessonsDone && !completedChallenge && (
          <button onClick={onChallenge} style={{ padding: "14px 36px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", letterSpacing: 1, boxShadow: `0 0 30px ${city.glow}` }}>
            ⚔️ FACE THE BOSS
          </button>
        )}
        {completedChallenge && (
          <button onClick={onBack} style={{ padding: "14px 36px", background: "rgba(247,201,72,0.15)", border: "1px solid #F7C94866", borderRadius: 14, color: "#F7C948", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            🗺️ Return to World Map
          </button>
        )}
      </div>
    </div>
  );
}

function LessonView({ lesson, city, hero, onComplete, onBack }) {
  const [step, setStep] = useState(0); // 0-3: key points; 4: analogy; 5: tip; 6: done
  const total = lesson.keyPoints.length + 2; // points + analogy + tip

  const progress = step / total;

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 24, fontFamily: "monospace" }}>← {city.name}</button>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 32 }}>{lesson.icon}</div>
        <div>
          <div style={{ color: city.color, fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>{lesson.title}</div>
          <div style={{ color: "#4b5563", fontSize: 12, fontFamily: "monospace" }}>{lesson.concept}</div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? city.color : "#1a2040", transition: "background 0.4s" }} />
        ))}
      </div>

      {/* Content card */}
      <div style={{ borderRadius: 20, padding: "32px 28px", background: "rgba(10,15,30,0.95)", border: `1.5px solid ${city.color}33`, marginBottom: 24, minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeUp 0.4s" }} key={step}>

        {step < lesson.keyPoints.length && (
          <>
            <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>KEY CONCEPT {step + 1}/{lesson.keyPoints.length}</div>
            <div style={{ color: city.color, fontWeight: 800, fontSize: 18, marginBottom: 14, letterSpacing: 0.5 }}>{lesson.keyPoints[step].label}</div>
            <div style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.8 }}>{lesson.keyPoints[step].text}</div>
          </>
        )}

        {step === lesson.keyPoints.length && (
          <>
            <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>🗺️ {hero.name.toUpperCase()} ENCOUNTERS AN ELDER</div>
            <div style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic", lineHeight: 1.8, background: `${city.color}0a`, border: `1px solid ${city.color}22`, borderRadius: 12, padding: "16px 20px" }}>
              "{lesson.analogy}"
            </div>
          </>
        )}

        {step === lesson.keyPoints.length + 1 && (
          <>
            <div style={{ fontSize: 11, color: "#F7C948aa", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>⚡ EXAM TIP</div>
            <div style={{ color: "#F7C948", fontWeight: 700, fontSize: 16, lineHeight: 1.8, background: "#F7C9480a", border: "1px solid #F7C94822", borderRadius: 12, padding: "16px 20px" }}>
              {lesson.tip}
            </div>
            <div style={{ color: "#4b5563", fontSize: 12, marginTop: 16, fontFamily: "monospace" }}>+{XP_LESSON} XP on completion</div>
          </>
        )}
      </div>

      {step < total ? (
        <button onClick={() => setStep(s => s + 1)} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {step < lesson.keyPoints.length ? "Next Concept →" : step === lesson.keyPoints.length ? "See the Exam Tip →" : "Complete Lesson ✓"}
        </button>
      ) : (
        <button onClick={onComplete} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", animation: "fadeUp 0.3s" }}>
          ✨ Claim +{XP_LESSON} XP →
        </button>
      )}
    </div>
  );
}

function BossFight({ city, hero, onComplete, onBack }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(null);

  const q = city.questions[idx];

  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) { setScore(s => s + 1); setFlash("correct"); }
    else { setShake(true); setFlash("wrong"); setTimeout(() => setShake(false), 600); }
    setTimeout(() => setFlash(null), 800);
  };

  const next = () => {
    if (idx + 1 >= city.questions.length) setDone(true);
    else { setIdx(i => i + 1); setSelected(null); setAnswered(false); }
  };

  if (done) {
    const pct = Math.round((score / city.questions.length) * 100);
    const won = pct >= 60;
    const gained = score * XP_CORRECT + (city.questions.length - score) * XP_WRONG;
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 560, margin: "0 auto", animation: "fadeUp 0.5s" }}>
        <div style={{ fontSize: 80, marginBottom: 20, animation: won ? "floatEl 2s infinite" : "none" }}>{won ? "🏆" : "💪"}</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: won ? "#F7C948" : city.color, marginBottom: 10, letterSpacing: 2 }}>
          {won ? `${city.bossName} DEFEATED!` : "KEEP TRAINING!"}
        </div>
        {won && <div style={{ color: city.color, fontSize: 14, marginBottom: 6 }}>The portal to the next city opens before you.</div>}
        <div style={{ color: "#6b7280", fontSize: 16, marginBottom: 8 }}>{score}/{city.questions.length} correct — {pct}%</div>
        <div style={{ color: "#F7C948", fontSize: 16, marginBottom: 32, fontFamily: "monospace" }}>+{gained} XP ⚡</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onComplete(score, city.questions.length)} style={{ padding: "14px 36px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {won ? "🗺️ World Map →" : "🗺️ Return to Map"}
          </button>
          {!won && <button onClick={() => { setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); }} style={{ padding: "14px 28px", background: "rgba(247,201,72,0.1)", border: "1px solid #F7C94844", borderRadius: 14, color: "#F7C948", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 Try Again</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>← RETREAT</button>
        <div style={{ color: city.color, fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>{city.bossEmoji} {city.bossName}</div>
        <div style={{ color: "#F7C948", fontFamily: "monospace", fontSize: 12 }}>⚔️ {score}/{city.questions.length}</div>
      </div>

      {/* Boss health bar */}
      <div style={{ height: 6, background: "#0a0f1e", borderRadius: 99, marginBottom: 6, overflow: "hidden", border: "1px solid #1a2040" }}>
        <div style={{ height: "100%", width: `${100 - (idx / city.questions.length) * 100}%`, background: `linear-gradient(90deg, #ef4444, #F7C948)`, borderRadius: 99, transition: "width 0.6s" }} />
      </div>
      <div style={{ color: "#374151", fontSize: 10, fontFamily: "monospace", textAlign: "center", marginBottom: 20 }}>BOSS HEALTH</div>

      {q.analogy && <div style={{ background: `${city.color}0d`, border: `1px solid ${city.color}22`, borderRadius: 12, padding: "12px 16px", marginBottom: 18, color: "#6b7280", fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>{q.analogy}</div>}

      <div style={{ color: "#f3f4f6", fontSize: 16, lineHeight: 1.8, marginBottom: 22, fontWeight: 500, animation: shake ? "shakeEl 0.5s" : "none" }}>{q.text}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.02)", border = "#1a2040", color = "#9ca3af";
          if (answered) {
            if (i === q.correct) { bg = "rgba(0,201,167,0.1)"; border = "#00C9A7"; color = "#00C9A7"; }
            else if (i === selected) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 18px", color, fontSize: 14, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "all 0.2s", lineHeight: 1.5 }}
              onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = city.color + "88"; e.currentTarget.style.color = "#e5e7eb"; } }}
              onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = "#1a2040"; e.currentTarget.style.color = "#9ca3af"; } }}>
              <span style={{ opacity: 0.3, marginRight: 10, fontFamily: "monospace" }}>{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ background: selected === q.correct ? "rgba(0,201,167,0.06)" : "rgba(247,201,72,0.06)", border: `1px solid ${selected === q.correct ? "#00C9A733" : "#F7C94833"}`, borderRadius: 14, padding: "18px 20px", color: "#d1d5db", fontSize: 13, lineHeight: 1.8, marginBottom: 18, animation: "fadeUp 0.4s" }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: selected === q.correct ? "#00C9A7" : "#F7C948" }}>
            {selected === q.correct ? "✨ Spell mastered!" : "📖 Learn the spell:"}
          </div>
          {q.explanation}
        </div>
      )}

      {answered && (
        <button onClick={next} style={{ width: "100%", padding: 16, background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", animation: "fadeUp 0.3s" }}>
          {idx + 1 >= city.questions.length ? "⚔️ Finish Battle" : "Next Attack →"}
        </button>
      )}

      {flash === "correct" && <div style={{ position: "fixed", inset: 0, background: "rgba(0,201,167,0.05)", pointerEvents: "none", zIndex: 999, animation: "fadeUp 0.5s forwards" }} />}
      {flash === "wrong" && <div style={{ position: "fixed", inset: 0, background: "rgba(239,68,68,0.05)", pointerEvents: "none", zIndex: 999, animation: "fadeUp 0.5s forwards" }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("char"); // char | map | city | lesson | boss
  const [hero, setHero] = useState(null);
  const [cities, setCities] = useState(CITIES);
  const [activeCity, setActiveCity] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState(null);

  const level = Math.floor(xp / 500) + 1;

  const showToast = (msg, color = "#00C9A7") => { setToast({ msg, color }); setTimeout(() => setToast(null), 3500); };

  const handleCharSelect = (c) => { setHero(c); setScreen("map"); showToast(`Welcome, ${c.name}! Your journey begins.`, c.color); };

  const handleCityClick = (city) => { setActiveCity(city); setScreen("city"); };

  const handleLessonClick = (lesson) => { setActiveLesson(lesson); setScreen("lesson"); };

  const handleLessonComplete = () => {
    if (!completedLessons.has(activeLesson.id)) {
      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
      setXp(x => x + XP_LESSON);
      showToast(`+${XP_LESSON} XP! Lesson complete! ✨`, activeCity.color);
    }
    setScreen("city");
  };

  const handleBossComplete = (score, total) => {
    const gained = score * XP_CORRECT + (total - score) * XP_WRONG;
    setXp(x => x + gained);
    const won = score / total >= 0.6;
    if (won && !completedChallenges.has(activeCity.id)) {
      setCompletedChallenges(prev => new Set([...prev, activeCity.id]));
      const idx = cities.findIndex(c => c.id === activeCity.id);
      if (idx < cities.length - 1) {
        setCities(prev => prev.map((c, i) => i === idx + 1 ? { ...c, locked: false } : c));
        showToast(`🌟 ${cities[idx + 1].name} UNLOCKED!`, "#F7C948");
      } else {
        showToast("🏆 ALL SKY-CITIES CONQUERED! You are a Data Architect!", "#F7C948");
      }
    }
    setScreen("city");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Raleway:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04080f; }
        @keyframes twkl { from { opacity: 0.05; } to { opacity: 0.8; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shakeEl { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        @keyframes floatEl { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1a2040; border-radius: 2px; }
        button { font-family: 'Raleway', sans-serif; }
        input { font-family: 'Raleway', sans-serif; }
      `}</style>

      <Stars />

      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#04080f", border: `1px solid ${toast.color}`, borderRadius: 12, padding: "12px 24px", color: toast.color, fontWeight: 700, fontSize: 13, zIndex: 9999, animation: "toastIn 0.4s ease", boxShadow: `0 0 30px ${toast.color}33`, fontFamily: "monospace", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #070d1f 0%, #04080f 60%)", fontFamily: "'Raleway', sans-serif", color: "#e5e7eb", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>

          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 10, letterSpacing: 8, color: "#1a2040", textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace" }}>✦ GCP PROFESSIONAL DATA ENGINEER ✦</div>
            <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(18px,3.5vw,36px)", fontWeight: 900, color: "#e5e7eb", letterSpacing: 2, marginBottom: 4, lineHeight: 1.3, textShadow: "0 0 40px rgba(247,201,72,0.2)" }}>
              THE SCORPIO<br />
              <span style={{ background: "linear-gradient(135deg, #F7C948 0%, #f97316 60%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SKY CHRONICLES</span>
            </h1>
            {hero && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                <div style={{ color: hero.color, fontWeight: 700, fontSize: 14 }}>{hero.art} {hero.name}</div>
                <div style={{ maxWidth: 280, width: "100%" }}>
                  <XPBar xp={xp} level={level} />
                </div>
              </div>
            )}
          </div>

          {screen === "char" && <CharacterSelect onSelect={handleCharSelect} />}
          {screen === "map" && <WorldMap cities={cities} hero={hero} xp={xp} level={level} completedLessons={completedLessons} completedChallenges={completedChallenges} onCityClick={handleCityClick} />}
          {screen === "city" && <CityView city={activeCity} hero={hero} completedLessons={completedLessons} completedChallenge={completedChallenges.has(activeCity?.id)} onLesson={handleLessonClick} onChallenge={() => setScreen("boss")} onBack={() => setScreen("map")} />}
          {screen === "lesson" && <LessonView lesson={activeLesson} city={activeCity} hero={hero} onComplete={handleLessonComplete} onBack={() => setScreen("city")} />}
          {screen === "boss" && <BossFight city={activeCity} hero={hero} onComplete={handleBossComplete} onBack={() => setScreen("city")} />}

        </div>
      </div>
    </>
  );
}