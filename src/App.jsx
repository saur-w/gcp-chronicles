import { useState } from "react";

const CHARACTERS = [
  { id: "kassandra", name: "Kassandra", origin: "Ancient Greece", color: "#c9a84c", accent: "#ffd700", desc: "Misthios of Sparta. Walks between worlds. Fears nothing.", art: "🏛️" },
  { id: "aloy", name: "Aloy", origin: "The Frontier", color: "#e8833a", accent: "#ff9f55", desc: "Seeker of truths. Master of ancient machines.", art: "🌿" },
  { id: "eivor", name: "Eivor", origin: "Norway", color: "#6b9fd4", accent: "#8fc0f0", desc: "Viking shieldmaiden. Conqueror of kingdoms.", art: "⚡" },
  { id: "zelda", name: "Zelda", origin: "Hyrule", color: "#9b72cf", accent: "#c4a7e7", desc: "Princess. Sage. Keeper of ancient wisdom.", art: "🔮" },
  { id: "custom", name: "Custom", origin: "Your World", color: "#4ade80", accent: "#86efac", desc: "Write your own legend.", art: "🌟" },
];

const CITIES = [
  {
    id: "bigquery", name: "Querythas", subtitle: "The Crystal Warehouse", emoji: "🏰",
    color: "#4A90E2", glow: "#4A90E230", domain: "BigQuery — Storage & Optimization",
    bossName: "The Cost Dragon", bossEmoji: "🐉", bossDesc: "An ancient beast that devours gold with every unoptimized query.", locked: false,
    lessons: [
      {
        id: "bq-1", title: "Partitioning vs Clustering", icon: "📦", concept: "How to organize data to save gold (money)",
        keyPoints: [
          { label: "Partitioning", text: "Physically divides table into segments by date/time. BigQuery skips entire partitions on queries — like locking castle wings you don't need. Directly reduces bytes scanned = reduces cost." },
          { label: "Clustering", text: "Sorts data WITHIN partitions by up to 4 columns. Order matters: go from LOWEST to HIGHEST cardinality (state → city → store_id). Helps BigQuery skip blocks within a partition." },
          { label: "Use both together!", text: "Partition by date + cluster by your filter columns = maximum performance. One does not replace the other — they complement each other." },
          { label: "⚠️ Critical Rule", text: "BigQuery only allows ONE partition column per table. You CANNOT partition by multiple columns simultaneously. This appears often as an exam trap!" },
        ],
        analogy: "Imagine a medieval archive: Partitioning = separate ROOMS per year (you only unlock the room you need, others stay locked). Clustering = inside each room, scrolls sorted by topic then author. You walk to the right room AND grab the right shelf instantly.",
        tip: "Exam trap: 'Partition by date AND location' → WRONG. BigQuery allows only one partition column. Also: clustering column order matters — put the column you filter most FIRST (lowest cardinality = widest filter).",
      },
      {
        id: "bq-2", title: "BigQuery Cost Control & Performance", icon: "💰", concept: "Slots, on-demand, materialized views and BI Engine",
        keyPoints: [
          { label: "On-demand pricing", text: "Pay per TB scanned. Good for unpredictable workloads. Risk: one unoptimized query scanning a full table can be very expensive." },
          { label: "Slots / Editions", text: "Reserve compute capacity. Predictable cost. Better for heavy, consistent workloads. BigQuery Editions: Standard, Enterprise, Enterprise Plus — each with different autoscaling and commitment options." },
          { label: "Materialized Views", text: "Pre-aggregate data physically. Auto-refreshed incrementally when base table changes. Best for repeated aggregation queries on large (TB+) tables. Reduces BOTH cost and latency." },
          { label: "BI Engine", text: "In-memory cache for fast dashboard queries on small dimension tables with concurrent users. Will NOT cache a 50TB fact table. Authorized Views = access control only, no performance benefit." },
        ],
        analogy: "On-demand = paying per meal at a restaurant (flexible, but eating a 50TB meal is ruinously expensive). Slots = buying a fixed meal plan (predictable cost). Materialized Views = the chef pre-cooks the most popular dish overnight so it's ready instantly, instead of cooking from scratch for every customer.",
        tip: "Exam pattern: 'Reduce response time + lower costs + minimize maintenance' for large repeatedly-aggregated table → Materialized Views wins. BI Engine is for dashboards on SMALL tables. Authorized Views are NEVER a performance answer.",
      },
      {
        id: "bq-3", title: "BigQuery ML & Analytics Hub", icon: "🤖", concept: "ML inside BigQuery and cross-team data sharing",
        keyPoints: [
          { label: "BigQuery ML (BQML)", text: "Train ML models using SQL directly inside BigQuery. No data movement needed. Supports: linear/logistic regression, XGBoost, k-means, DNN, ARIMA time-series. Fastest path to ML when data is already in BigQuery." },
          { label: "BQML serving limitation", text: "BigQuery has high per-query latency (100ms+). For online serving at <100ms → pre-compute predictions with Dataflow and serve from Bigtable, not BigQuery directly." },
          { label: "Analytics Hub", text: "Publish datasets once. Other teams/orgs SUBSCRIBE — zero data duplication. Automatically creates an authorized dataset at subscription time. Ideal for cross-team or cross-org data sharing." },
          { label: "Analytics Hub vs Authorized Views", text: "Authorized views = control who sees specific columns/rows. Analytics Hub = share entire curated datasets across teams with minimal operational overhead. Analytics Hub wins on 'minimize operational effort'." },
        ],
        analogy: "BQML is like having a mathematician who LIVES inside your library — ask them in the library's own language (SQL) and they compute predictions without ever moving the books. Analytics Hub is the royal decree: 'All guilds may read from the central archive' — one original, unlimited subscribers, zero copies.",
        tip: "Key exam distinction: Analytics Hub automatically creates the authorized dataset at subscription time → 'minimize operational overhead for cross-team sharing' = Analytics Hub. bigquery.jobUser = run jobs only, NO data access. For data: bigquery.dataViewer+.",
      },
      {
        id: "bq-4", title: "Dataform, BigLake & Dataplex", icon: "🏗️", concept: "Modern data governance and SQL transformation tooling",
        keyPoints: [
          { label: "Dataform", text: "Orchestrates SQL transformations INSIDE BigQuery (the T in ELT). Define model dependencies, schedule runs, version-control SQL with Git. Think: dbt for BigQuery, but native GCP." },
          { label: "Dataform vs Dataflow", text: "Dataform = SQL-only ELT transformations in BigQuery (no code). Dataflow = Apache Beam pipelines for ETL/streaming (code required). Common exam confusion!" },
          { label: "BigLake", text: "Unified storage engine that applies BigQuery security and governance to data in Cloud Storage, other clouds, and databases. Query data lake files with BigQuery fine-grained access controls." },
          { label: "Dataplex", text: "Unified data governance layer. Manages, discovers, and governs data WHERE IT LIVES (no migration). Automated discovery, lineage tracking, quality validation. Organizes into Lakes → Zones → Assets." },
        ],
        analogy: "Dataform is the master SQL scribe who knows the correct order to write all ledgers (dependencies), keeps a git history of every scroll, and auto-schedules updates. Dataplex is the royal cartographer who maps ALL the kingdom's treasures without ever moving them from their vaults.",
        tip: "Exam keywords: 'orchestrate SQL transformations in BigQuery with dependencies' → Dataform. 'Data discovery + lineage + quality across multiple storage systems' → Dataplex. 'Query GCS files with BigQuery fine-grained security' → BigLake.",
      },
    ],
    questions: [
      { text: "You need to query a 10TB transactions table filtering by the last 30 days and grouping by state, city, and store. How should you structure the table for best performance and lowest cost?", analogy: "🐉 The Cost Dragon charges gold per byte scanned!", options: ["Partition by transaction_time; cluster by state → city → store_id", "Partition by transaction_time; cluster by store_id → city → state", "Cluster only by state → city → store_id (no partition)", "Partition by state; cluster by transaction_time"], correct: 0, explanation: "Partition by time prunes old data from scans (only reads the last 30 days). Cluster from LOW to HIGH cardinality (state→city→store_id) matches the most common filter patterns and maximizes block pruning. Reverse clustering order reduces pruning efficiency. You cannot partition by multiple columns." },
      { text: "Your BI tool runs hundreds of queries daily aggregating a 50TB sales table at day and month levels. Queries are slow and expensive. Reduce response time, lower costs, minimize maintenance.", options: ["Build materialized views with day and month aggregations", "Build authorized views with day and month aggregations", "Enable BI Engine and add the sales table as a preferred table", "Create a scheduled query to build aggregate tables hourly"], correct: 0, explanation: "Materialized views physically pre-aggregate data and auto-refresh incrementally. BI Engine caches small dimension tables but WON'T hold a 50TB table in memory. Authorized views control access but don't improve performance at all. Scheduled queries add lag, cost, and maintenance overhead." },
      { text: "Multiple teams need access to centralized customer data in BigQuery. Minimize data duplication and operational overhead.", options: ["Ask each team to create authorized views. Grant bigquery.jobUser role.", "Publish data in BigQuery Analytics Hub. Direct teams to subscribe.", "Create a scheduled query to replicate customer data into each team project.", "Enable each team to create materialized views of the data they need."], correct: 1, explanation: "Analytics Hub creates an authorized dataset automatically at subscription time — zero data duplication. bigquery.jobUser doesn't grant data access (only run jobs). Replicating data increases cost and maintenance. Materialized views also duplicate data and add operational overhead." },
      { text: "You want to orchestrate a series of SQL transformations inside BigQuery with dependency management and version control, minimizing operational overhead.", options: ["Cloud Composer with BigQueryInsertJobOperator for each transformation", "Dataform to define SQL models with dependencies and schedule runs", "Python script with BigQuery client library running on Cloud Run", "Dataflow with BigQueryIO to read, transform, and write back to BigQuery"], correct: 1, explanation: "Dataform is purpose-built for orchestrating SQL transformations inside BigQuery (ELT pattern). It handles model dependencies, version control via Git, and scheduling natively with zero infrastructure. Cloud Composer works but adds infrastructure overhead. Dataflow is for Apache Beam pipelines, not SQL-only ELT." },
      { text: "An application needs to serve BigQuery ML predictions per user_id with <100ms latency at high QPS. What architecture?", options: ["Query BigQuery ML directly with WHERE user_id=? for each request", "Create an authorized view and grant it to the application service account", "Dataflow reads BigQuery ML predictions → writes to Bigtable (user_id as row key) → app reads from Bigtable", "Export BigQuery ML predictions to Cloud Storage and serve via signed URLs"], correct: 2, explanation: "BigQuery latency regularly exceeds 100ms for single-row lookups due to planning, queue, and slot startup. Pre-compute predictions with Dataflow, store in Bigtable (user_id as row key = O(1) lookups <10ms), app reads from Bigtable. Decouple inference (BigQuery, expensive) from serving (Bigtable, fast)." },
      { text: "You want to share a sales dataset across your organization. You need a self-serving, low-maintenance, and cost-effective solution. What should you do?", analogy: "🐉 The dragon hoards duplicated datasets — defeat it with zero-copy sharing!", options: ["Use BigQuery Data Transfer Service to schedule copies to each team's project", "Create and share standard views with users in other business units", "Create a BigQuery Analytics Hub private exchange and publish the sales dataset", "Enable other business units to access authorized views of the dataset"], correct: 2, explanation: "Analytics Hub is cost-effective (no data copying), self-serving (teams subscribe themselves), and low-maintenance (no reauthorizations). DTS creates stale copies with 12h lag and extra storage cost. Authorized views require ongoing maintenance and reauthorizations per dataset change." },
      { text: "You need to preprocess customer PII data from Cloud Storage for analysis while complying with privacy requirements. Removing fields would lose analytical value. What should you do?", options: ["Use Dataflow and Cloud KMS to encrypt sensitive fields, write to BigQuery, share the key with analysts", "Use Cloud DLP API and Dataflow to detect and REMOVE sensitive fields, then write filtered data to BigQuery", "Use Dataflow and Cloud DLP API to MASK sensitive data, write the processed data to BigQuery", "Use CMEK to encrypt Cloud Storage data, use BigQuery federated queries, share key by least privilege"], correct: 2, explanation: "Cloud DLP masking (de-identification) preserves data structure and analytical value while protecting PII. Removing fields loses information. Encrypting and sharing keys is not scalable for org-wide use. CMEK+federated queries doesn't transform the sensitive fields." },
      { text: "You need to look at a specific BigQuery table multiple times a day using spreadsheets. You want an efficient, low-maintenance method for non-technical stakeholders. What should you do?", options: ["Export the table to Cloud Storage as CSV and download it each time", "Use Dataflow to replicate the table to Cloud SQL and connect via Sheets", "Use BigQuery Connected Sheets to directly query the table from Google Sheets", "Create a Looker Studio dashboard connected to the BigQuery table"], correct: 2, explanation: "BigQuery Connected Sheets allows non-technical users to query BigQuery directly from Google Sheets — no exports, no ETL, always fresh data. It's the purpose-built, low-maintenance solution for spreadsheet-based BigQuery access. Looker Studio is for dashboards, not spreadsheet workflows." },
    ],
  },
  {
    id: "dataflow", name: "Streamhaven", subtitle: "The River City", emoji: "🌊",
    color: "#00C9A7", glow: "#00C9A730", domain: "Dataflow & Pub/Sub — Processing & Streaming",
    bossName: "The Watermark Hydra", bossEmoji: "🐍", bossDesc: "A many-headed beast — cut one delay and two more appear.", locked: true,
    lessons: [
      {
        id: "df-1", title: "Dataflow & Dataproc — When to Use Which", icon: "🌊", concept: "Serverless streaming vs managed Spark/Hadoop",
        keyPoints: [
          { label: "Dataflow = Apache Beam, serverless", text: "You write pipelines in Apache Beam (Python/Java). Dataflow executes them with autoscaling and no cluster management. Best for: streaming (real-time), new ETL pipelines, when you want zero ops." },
          { label: "Dataproc = managed Spark/Hadoop", text: "Managed clusters running Spark, Hive, Hadoop. Best for: lift-and-shift existing on-prem Spark/Hadoop jobs, teams with existing Spark expertise, HDFS-dependent workflows." },
          { label: "Ephemeral Dataproc clusters", text: "Create cluster → run job → delete cluster. Pay only while running. This is the exam-preferred pattern for cost efficiency vs. keeping persistent clusters running 24/7." },
          { label: "I/O intensive Hadoop on Dataproc", text: "Problem: disk I/O intensive jobs are slower on Dataproc than bare-metal. Fix: store INTERMEDIATE shuffle data on native HDFS (Persistent Disk). GCS adds network latency for intermediate I/O." },
        ],
        analogy: "Dataflow is a magical self-building river mill: you give it a blueprint (Beam pipeline), it builds itself, adjusts its size for the water volume (autoscaling), and you never touch the machinery. Dataproc is renting a proven forge crew that already knows how to use YOUR existing Spark hammers.",
        tip: "Keyword guide: 'serverless + autoscaling + streaming + no ops' → Dataflow. 'Existing Spark/Hadoop/Hive jobs + lift-and-shift' → Dataproc. 'I/O intensive Hadoop slower on Dataproc' → store intermediate data on local HDFS (not GCS).",
      },
      {
        id: "df-2", title: "Dataflow Windows & Late Data", icon: "⏱️", concept: "Grouping streaming events by time — the hardest topic on the exam",
        keyPoints: [
          { label: "Fixed Windows (Tumbling)", text: "Non-overlapping, equal-size time windows. 'Aggregate every 1 hour.' FixedWindows(Duration.standardHours(1)). Most common window type on exam. Events belong to exactly one window." },
          { label: "Sliding Windows", text: "Overlapping windows. 'Average of last 30 min, recalculated every 5 min.' Each event may belong to multiple windows. Good for moving averages and rolling metrics." },
          { label: "Session Windows", text: "Defined by gaps in activity, not fixed time. Closes after X minutes of silence. Good for user session analysis. Window size varies per user." },
          { label: "Watermarks + AllowedLateness", text: "Watermark = system's estimate that all events up to time T have arrived. Window closes at watermark. AllowedLateness = how long to wait for late-arriving events before dropping them (or routing to DLQ)." },
        ],
        analogy: "Tumbling windows = collect rain in a bucket for exactly 1 hour, then empty and record. Sliding windows = check the bucket every 5 min but measure rain from the last 30. Watermark = your assistant saying 'I believe all rain from 3pm has arrived'. AllowedLateness = 'wait 5 more minutes for any stragglers before closing the record'.",
        tip: "'Aggregate events over hourly intervals from Pub/Sub, must scale' → ALWAYS Dataflow streaming with tumbling windows. Cloud Functions cannot natively aggregate state across time without external storage. Batch Dataflow hourly = unnecessary lag and overhead.",
      },
      {
        id: "df-3", title: "Pub/Sub Core Concepts", icon: "📡", concept: "The messaging backbone for all streaming architectures",
        keyPoints: [
          { label: "Topics & Subscriptions — decoupled", text: "Publishers send to Topics. Subscribers pull from Subscriptions. Fully decoupled: many publishers, many subscribers, each independently scalable. Pub/Sub absorbs spikes automatically." },
          { label: "At-least-once delivery", text: "Pub/Sub guarantees each message is delivered AT LEAST ONCE. Duplicates CAN happen. Your consumer MUST be idempotent — design your pipeline to handle duplicate messages correctly." },
          { label: "Dead Letter Queue (DLQ)", text: "Configure a dead-letter topic on a subscription. Messages that fail after maxDeliveryAttempts are routed there. Critical for error handling without losing data. Always configure DLQ for production." },
          { label: "VPC Service Controls for Pub/Sub", text: "Pub/Sub is serverless — firewall rules have ZERO effect on it. To prevent cross-project data exfiltration: use VPC Service Controls with a perimeter around the SOURCE project." },
        ],
        analogy: "Pub/Sub is the royal postal service: letters (messages) go to a central sorting office (topic). Any guild (subscriber) with a registered mailbox gets delivery. If delivery fails repeatedly, the letter goes to the 'undeliverable pile' (DLQ) for investigation. Firewall rules = gates — useless against teleporting wizards (serverless services).",
        tip: "Pub/Sub security trap: firewall rules and VPC-level controls do NOT work for serverless services like Pub/Sub or BigQuery. For cross-project isolation → VPC Service Controls with a project-level perimeter. This comes up repeatedly on the exam.",
      },
      {
        id: "df-4", title: "Streaming Architecture Patterns", icon: "🔗", concept: "How Pub/Sub, Dataflow, BigQuery and Cloud Storage connect",
        keyPoints: [
          { label: "The Golden Combo", text: "Pub/Sub → Dataflow → BigQuery. Pub/Sub ingests and buffers spikes. Dataflow transforms, validates, deduplicates, and aggregates. BigQuery stores for SQL analytics." },
          { label: "Dual-write for raw + analytics", text: "Dataflow writes to two destinations: Cloud Storage (raw Avro, indefinite cheap retention) AND BigQuery (SQL analytics). Avro = preferred over JSON: compact binary, schema-embedded, faster to parse." },
          { label: "Datastream for CDC", text: "Serverless Change Data Capture. Continuously replicates changes from Oracle/MySQL/PostgreSQL to BigQuery or Cloud Storage. No VMs, no Kafka, no Debezium. 'Minimize infra + continuous sync from operational DB' → Datastream." },
          { label: "Cloud Storage classes lifecycle", text: "Standard (frequent access) → Nearline (monthly, 30-day min) → Coldline (quarterly, 90-day min) → Archive (yearly, 365-day min). Object Lifecycle Management automates transitions automatically. Reduces cost for aging data." },
        ],
        analogy: "The river (Pub/Sub) flows through the mill (Dataflow) to two reservoirs: a huge lake (Cloud Storage, cheap, forever) and a crystal pool (BigQuery, queryable). Datastream is an underground tunnel that automatically copies every change from the old castle's treasury (on-prem database) without disrupting it.",
        tip: "For 'decouple + buffer + near real-time SQL + cheap indefinite raw storage' → Pub/Sub + Dataflow → BigQuery + Cloud Storage (Avro). Object Lifecycle Management = exam answer for 'automatically reduce storage costs for aging data without manual work'.",
      },
    ],
    questions: [
      { text: "A Dataflow streaming pipeline is processing slowly. The job graph was automatically merged (fused) into one step. How do you identify the bottleneck?", analogy: "🐍 The Hydra hides inside fused steps!", options: ["Check Cloud Logging for error messages on workers", "Insert a Reshuffle after each processing step; monitor execution details in the Dataflow console", "Increase the number of Dataflow workers immediately", "Restart the job with more memory allocated"], correct: 1, explanation: "Reshuffle prevents step fusion, forcing Dataflow to show individual step metrics in the console. This reveals which step accumulates backlog. Cloud Logging shows errors, not throughput bottlenecks. Scaling without knowing the bottleneck location may not help at all." },
      { text: "You need to process events from Pub/Sub and aggregate over hourly intervals before loading to BigQuery. High event volume, must scale automatically. What technology?", options: ["Cloud Function triggered by Pub/Sub per message", "Cloud Function scheduled hourly to pull Pub/Sub messages", "Dataflow batch job scheduled to run every hour", "Dataflow streaming job with tumbling windows of 1 hour"], correct: 3, explanation: "Dataflow streaming with FixedWindows(1h): auto-scales horizontally, processes continuously (no batch lag), has native windowing primitives with allowedLateness for late data, and writes directly to BigQuery. Cloud Functions cannot aggregate state across time natively. Hourly batch Dataflow creates unnecessary backlog and overhead." },
      { text: "You need to replicate and continuously sync 50 Oracle tables (on a VM in a VPC) to BigQuery, minimizing infrastructure management.", options: ["Deploy Kafka in the VPC + Kafka Connect Oracle CDC + BigQuery Sink Connector", "Deploy Kafka in the VPC + Kafka Connect Oracle CDC + Dataflow to BigQuery", "Create a Datastream service Oracle→BigQuery with private connectivity to the VPC", "Deploy Debezium Oracle connector + Pub/Sub for change capture"], correct: 2, explanation: "Datastream is a serverless CDC service — zero VMs to manage. Private connectivity configuration reaches the Oracle VM in the VPC securely. Kafka requires VM clusters (brokers, Zookeeper). Debezium also requires a VM to run. 'Minimize infrastructure' → serverless Datastream always wins." },
      { text: "Your pipeline must auto-scale, process each message at least once, and maintain message ordering within 1-hour windows. Which combination?", options: ["Apache Kafka + Cloud Dataproc", "Apache Kafka + Cloud Dataflow", "Cloud Pub/Sub + Cloud Dataproc", "Cloud Pub/Sub + Cloud Dataflow"], correct: 3, explanation: "Pub/Sub = fully managed, serverless, auto-scaling ingestion with at-least-once delivery. Dataflow = at-least-once semantics, 1h tumbling windows in event time, ordering by key, Streaming Engine autoscaling. Kafka requires manual cluster management. Dataproc lacks native streaming windowing primitives." },
      { text: "You store 150 GB/day of JSON events (growing). Need: decouple producers/consumers, cost-efficient indefinite raw storage, near real-time SQL, 2+ years SQL history.", options: ["API polling → Cloud Storage as gzipped JSON", "App writes to Cloud SQL + periodic exports to BigQuery", "Pub/Sub + Spark on Dataproc → Avro on HDFS", "Pub/Sub + Dataflow transforms JSON→Avro → Cloud Storage AND BigQuery"], correct: 3, explanation: "Pub/Sub decouples producers from consumers. Dataflow transforms JSON→Avro (compact + schema-embedded) and dual-writes: Cloud Storage (indefinite cheap archive) + BigQuery (near real-time SQL + 2yr history). HDFS on Persistent Disk is expensive to operate. Cloud SQL doesn't scale for analytics workloads." },
      { text: "A ride-hailing app processes driver location updates (every 5s) and booking events from Pub/Sub. You need real-time aggregation of supply/demand for the last 30 seconds, recalculated every 2 seconds, stored for low-latency dashboard access. What should you do?", analogy: "🐍 The Hydra spawns in real-time — you need an overlapping window net to catch it!", options: ["Tumbling window in Dataflow → write aggregated data to Memorystore", "Hopping window in Dataflow → write aggregated data to Memorystore", "Session window in Dataflow → write aggregated data to BigQuery", "Hopping window in Dataflow → write aggregated data to BigQuery"], correct: 1, explanation: "Hopping (sliding) window: 30s duration, 2s period — exactly what's needed for overlapping, recalculated aggregations. Memorystore (Redis) provides the <1ms latency needed for real-time dashboards. Tumbling windows are non-overlapping (stale data between windows). BigQuery has too much latency for real-time dashboard reads." },
      { text: "You need to design a Dataflow batch pipeline to mitigate multiple zonal failures at job submission time. What should you do?", options: ["Specify a worker region using the --region flag instead of a specific zone", "Create an Eventarc trigger to resubmit the job on zonal failure", "Submit duplicate pipelines in two different zones using the --zone flag", "Set the pipeline staging location as a regional Cloud Storage bucket"], correct: 0, explanation: "Specifying --region (not --zone) lets Dataflow automatically select the best available zone within the region, providing fault tolerance across zones. Eventarc retry adds delay and overhead. Duplicate pipelines double cost without full coverage. Regional staging bucket doesn't address worker zonal failures." },
      { text: "You are designing an Apache Beam pipeline to enrich Pub/Sub streaming data with static reference data from BigQuery. The reference data is small enough to fit in worker memory. What pipeline type and transforms should you use?", options: ["Batch job, PubSubIO, side-inputs", "Streaming job, PubSubIO, JdbcIO, side-outputs", "Streaming job, PubSubIO, BigQueryIO, side-inputs", "Streaming job, PubSubIO, BigQueryIO, side-outputs"], correct: 2, explanation: "Streaming job because the source is Pub/Sub (unbounded). PubSubIO reads the stream. BigQueryIO reads the reference data. Side-inputs are used to broadcast small, static datasets (reference data) to all workers so each element can be enriched without joining. Side-outputs route data, not enrich it." },
    ],
  },
  {
    id: "storage", name: "The Vault", subtitle: "City of Storage Secrets", emoji: "🗝️",
    color: "#E05C5C", glow: "#E05C5C30", domain: "Storage Systems — Bigtable, Spanner, Cloud Storage, IAM",
    bossName: "The Permission Thief", bossEmoji: "🦹", bossDesc: "Steals access when you least expect it. Over-permissions are its weapon.", locked: true,
    lessons: [
      {
        id: "st-1", title: "Choosing the Right Storage Service", icon: "🗄️", concept: "The most critical decision framework on the entire exam",
        keyPoints: [
          { label: "BigQuery", text: "Analytics warehouse. Petabyte scale. ANSI SQL. High per-query latency (100ms+). NOT for single-row serving or <100ms requests. Best for: analytics, reporting, ML training data." },
          { label: "Bigtable", text: "NoSQL wide-column store. Single-digit ms latency. Millions of ops/sec. Best for: time-series, IoT, high-throughput key-value, serving ML predictions. Row key design is CRITICAL — it determines performance." },
          { label: "Cloud Spanner", text: "Globally distributed RELATIONAL database. Strong ACID consistency at planetary scale. Best for: global financial systems, global OLTP needing consistency. More expensive than Cloud SQL." },
          { label: "Cloud SQL", text: "Managed MySQL/PostgreSQL/SQL Server. Standard relational OLTP. Limited horizontal scale. Best for: 'PostgreSQL/MySQL compatibility + minimize cost + single-region'." },
        ],
        analogy: "BigQuery = royal archives (great for research, slow for one scroll). Bigtable = palace courier dispatch (instant per-entity lookup, organized by recipient ID). Spanner = empire-wide treasury (global, always consistent, expensive). Cloud SQL = the village accountant (reliable, can't serve the empire).",
        tip: "Memorize this decision table: '<10ms latency + global scale' → Bigtable. 'Global ACID transactions' → Spanner. 'PostgreSQL/MySQL + minimize cost' → Cloud SQL. 'Analytics SQL on TBs/PBs' → BigQuery. These scenarios appear constantly.",
      },
      {
        id: "st-2", title: "Bigtable Row Key Design", icon: "🔑", concept: "The #1 Bigtable topic — deserves its own lesson",
        keyPoints: [
          { label: "Hotspotting — the enemy", text: "If row keys are monotonically increasing (e.g., timestamps, sequential IDs), ALL writes go to ONE tablet server → that server becomes the bottleneck while others idle. Performance degrades as data grows." },
          { label: "Fix: Entity prefix + timestamp", text: "Put the entity you query by FIRST (stock symbol, user_id, device_id), THEN timestamp. e.g., 'AAPL#1234567890'. Different entities map to different tablet servers → balanced load." },
          { label: "Reverse timestamp pattern", text: "Use reversed timestamps (Long.MAX_VALUE - timestamp) so MOST RECENT data comes FIRST in scans. Perfect for 'get the latest N records per entity' queries." },
          { label: "Salting for super-hot keys", text: "If a tiny set of entities gets ALL traffic (e.g., one stock), prefix with a random salt ('3#AAPL#timestamp') to spread reads/writes across multiple tablets." },
        ],
        analogy: "Organizing library by 'date book arrived' = all TODAY's books pile up at one librarian's desk (hotspot!). Organizing by AUTHOR first, then date = each librarian handles a fair share of authors (balanced load). Bigtable: entity (author) → timestamp (date), NOT timestamp first.",
        tip: "Classic exam scenario: 'datetime as start of row key → performance degrades as more data is added + thousands of concurrent users' → ALWAYS fix by starting row key with the entity identifier (stock symbol, user_id, device_id). This exact scenario has appeared repeatedly.",
      },
      {
        id: "st-3", title: "Cloud Storage Classes & Lifecycle", icon: "🧊", concept: "Optimize storage costs based on data access frequency",
        keyPoints: [
          { label: "Standard", text: "Hot data. Frequent access. No minimum storage duration. No retrieval fees. Highest per-GB price. Best for: active datasets, serving content, ML training data accessed daily." },
          { label: "Nearline → Coldline → Archive", text: "Nearline: ~monthly access, 30-day min. Coldline: ~quarterly, 90-day min. Archive: ~yearly, 365-day min. Each tier: lower storage price + higher retrieval price + minimum duration penalty for early deletion." },
          { label: "Object Lifecycle Management", text: "Automatically transitions objects between storage classes based on age rules. e.g., 'After 30 days → Nearline. After 90 days → Coldline. After 365 days → Archive.' Zero manual work. Exam loves this for 'minimize cost automatically'." },
          { label: "Dual-region + Turbo Replication", text: "Dual-region bucket with turbo replication = RPO of 15 minutes. Used for disaster recovery requiring <15 min data loss. Multi-region has RPO of 1 hour (not enough for 15-min RPO requirement)." },
        ],
        analogy: "Storage classes are like a library system: Standard = books on your desk (instant, expensive space). Nearline = shelves in the next room (30 sec). Coldline = storage room (5 min). Archive = off-site warehouse (days to retrieve, very cheap). Object Lifecycle = the librarian automatically moves untouched books to progressively cheaper locations.",
        tip: "Object Lifecycle Management is a frequent exam answer for 'automatically reduce storage costs for aging data with no operational overhead'. Also: dual-region + turbo replication for 15-min RPO. Multi-region alone only gives 1-hour RPO.",
      },
      {
        id: "st-4", title: "IAM, Encryption & VPC Service Controls", icon: "🛡️", concept: "Securing access and data in GCP",
        keyPoints: [
          { label: "Principle of Least Privilege", text: "Always grant minimum permissions. bigquery.dataViewer (read data) < bigquery.dataEditor < bigquery.dataOwner. bigquery.jobUser = run jobs ONLY, does NOT grant data access. A very common exam trap." },
          { label: "CMEK vs EKM", text: "CMEK (Customer-Managed Encryption Keys) = key stored in Cloud KMS on Google infrastructure. EKM (External Key Manager) = key stays on YOUR on-premises HSM, NEVER exported to Google. Use EKM when requirement says 'key must never leave our hardware'." },
          { label: "VPC Service Controls", text: "Security perimeter around PROJECTS (not VPCs). Prevents data exfiltration for serverless APIs: BigQuery, Pub/Sub, GCS, etc. Firewall rules are useless for serverless services — they don't have IPs to block." },
          { label: "Cloud DLP / Sensitive Data Protection", text: "CryptoDeterministicConfig = deterministic tokenization (same input → same token always) → preserves ability to JOIN across datasets. CryptoHashConfig = irreversible hash, no JOIN possible. Dynamic Data Masking = display-only, data stays intact." },
        ],
        analogy: "EKM = a hotel where you bring your own padlock — the hotel operates the door, but the actual key NEVER leaves your keychain. VPC Service Controls = a magical force field around the entire kingdom that even teleporting wizards (serverless services) cannot penetrate.",
        tip: "Double trap: (1) bigquery.jobUser ≠ data access. (2) Firewall rules + VPC perimeter = zero effect on serverless. For cross-project serverless isolation → VPC Service Controls. For 'key stays on my hardware' → Cloud EKM, not Cloud KMS or Cloud HSM (those store keys on Google infra).",
      },
    ],
    questions: [
      { text: "Stock trade data in Bigtable has datetime as the start of the row key. Thousands of concurrent users. Performance degrades as data grows. What do you do?", analogy: "🦹 All the load is hitting one tablet — the thief blocked all other doors!", options: ["Change row key to start with stock symbol", "Change row key to start with a random number per second", "Migrate the data to BigQuery instead", "Add more Bigtable nodes to handle the load"], correct: 0, explanation: "Datetime-first row keys cause hotspotting: all recent writes land on one tablet server while others are idle. Starting with stock symbol distributes writes across symbols (different tablet servers = balanced load). Adding nodes helps temporarily but doesn't fix the fundamental key design flaw." },
      { text: "You store raw data in Cloud Storage. Data is accessed frequently in the first 30 days, rarely between 30-90 days, almost never after 90 days. How do you minimize costs automatically?", options: ["Manually move files to Coldline storage after 90 days using a script", "Set Object Lifecycle Management: Standard → Nearline at 30 days → Coldline at 90 days", "Use Archive storage class for all data from the start", "Create a Cloud Composer DAG to move files between buckets on a schedule"], correct: 1, explanation: "Object Lifecycle Management automates storage class transitions based on age rules with zero operational overhead. Standard→Nearline at 30 days (monthly access pattern), →Coldline at 90 days (quarterly). Archive from the start would charge retrieval fees during the first 30 days of frequent access." },
      { text: "You must encrypt BigQuery data with a key that must NEVER leave your on-premises HSM. Use Google-managed solutions.", options: ["Create key in on-prem HSM, import into Cloud KMS. Associate with BigQuery.", "Create key in on-prem HSM, import into Cloud HSM. Associate with BigQuery.", "Create key in on-prem HSM, link to Cloud EKM. Associate the Cloud KMS reference with BigQuery.", "Encrypt data before ingesting into BigQuery using your on-prem key."], correct: 2, explanation: "Cloud EKM keeps key material on YOUR external HSM — it NEVER moves to Google infrastructure. Cloud KMS holds a reference (not the actual key). Importing to Cloud KMS or Cloud HSM physically moves the key to Google's infrastructure, violating the 'must never leave on-premises HSM' requirement." },
      { text: "Project A has a Pub/Sub topic with confidential data. Prevent Project B and all future projects from accessing it.", options: ["Configure VPC Service Controls with a perimeter around Project A", "Add firewall rules to allow only Project A VPC traffic to Pub/Sub", "Use IAM conditions so only Project A users can access Project A resources", "Enable Private Google Access in Project A's VPC"], correct: 0, explanation: "VPC Service Controls creates a project-level security perimeter and explicitly supports Pub/Sub. Pub/Sub is serverless — firewall rules have ZERO effect. IAM conditions don't support project_id filtering for Pub/Sub. Private Google Access affects network routing, not cross-project access control." },
      { text: "An application needs to serve BigQuery ML predictions per user_id with <100ms latency. What architecture?", options: ["Query BigQuery ML directly with WHERE user_id=? for each request", "Create an authorized view of the predictions dataset", "Dataflow reads BigQuery ML predictions → writes to Bigtable (user_id as row key) → app reads from Bigtable", "Export predictions to Cloud Storage and serve via signed URLs"], correct: 2, explanation: "BigQuery consistently exceeds 100ms per single-row lookup (planning + slot queue + cold cache). Pre-compute predictions with Dataflow, materialize in Bigtable keyed by user_id (O(1) lookup = <10ms), app reads from Bigtable. Decouple inference (batch, expensive) from serving (real-time, fast)." },
      { text: "An exposed Cloud KMS key was used to protect Cloud Storage data. You need to re-encrypt all affected data and ensure future objects always have CMEK protection. What should you do?", analogy: "🦹 The thief stole your key — time to change ALL the locks AND make sure new doors auto-lock!", options: ["Rotate the Cloud KMS key version. Continue using the same bucket.", "Create a new Cloud KMS key. Set it as the default CMEK on the existing bucket.", "Create a new Cloud KMS key. Create a new bucket. Copy objects specifying the new key in the copy command.", "Create a new Cloud KMS key. Create a new bucket configured with the new key as default CMEK. Copy all objects without specifying a key."], correct: 3, explanation: "New bucket with default CMEK ensures ALL future writes are automatically protected. Copying without specifying a key forces the bucket default to apply, re-encrypting all data. Rotating key version doesn't re-encrypt existing objects. Setting default CMEK on old bucket only protects new writes. Specifying key on copy works but doesn't guarantee future protection." },
      { text: "You need to connect multiple applications with dynamic public IP addresses to a Cloud SQL instance securely. You've enforced SSL and want to use Cloud SQL public IP. What should you do?", options: ["Add all application networks to Authorized Networks, updating them regularly", "Add CIDR 0.0.0.0/0 to Authorized Networks, use IAM to manage users", "Add CIDR 0.0.0.0/0 to Authorized Networks, use Cloud SQL Auth Proxy on all apps", "Leave Authorized Networks empty. Use Cloud SQL Auth Proxy on all applications."], correct: 3, explanation: "Cloud SQL Auth Proxy handles secure connections for apps with dynamic IPs — no need to maintain Authorized Networks lists. Leaving Authorized Networks empty means only Auth Proxy connections are permitted, which is the most secure setup. Opening 0.0.0.0/0 exposes the database to the public internet." },
      { text: "You want analysts to read a shared dataset but not modify it. Each analyst should also have their own private workspace in the same project where only they can create/access their tables. What should you do?", options: ["Grant BigQuery Data Viewer at project level. Create one shared dataset, grant Data Editor on that dataset.", "Grant BigQuery Data Viewer at project level. Create one dataset per analyst, grant Data Editor at project level.", "Grant BigQuery Data Viewer on the shared dataset. Create one dataset per analyst, grant Data Editor at dataset level per analyst.", "Grant BigQuery Data Viewer on the shared dataset. Create one other shared dataset, grant Data Editor on that dataset."], correct: 2, explanation: "Three conditions needed: (1) Data Viewer at DATASET level (not project — otherwise analysts can read each other's datasets). (2) One dataset PER analyst (for isolation). (3) Data Editor at DATASET level per analyst (not project — otherwise they can edit everyone's data). Only C satisfies all three." },
    ],
  },
  {
    id: "vertex", name: "The Oracle Spire", subtitle: "City of Machine Learning", emoji: "🔮",
    color: "#A259FF", glow: "#A259FF30", domain: "Vertex AI, ML Pipelines & Feature Engineering",
    bossName: "The Overfitting Specter", bossEmoji: "👁️", bossDesc: "A model that memorized training data and fails on everything real.", locked: true,
    lessons: [
      {
        id: "va-1", title: "Vertex AI Platform Overview", icon: "🤖", concept: "GCP's unified ML platform — what the exam expects",
        keyPoints: [
          { label: "AutoML vs Custom Training", text: "AutoML: no-code, point at labeled data, Google selects model architecture. Best for: quick results, limited ML expertise, tabular/image/text/video. Custom Training: bring your own code (TF, PyTorch, scikit-learn). Best for: full control, custom architectures." },
          { label: "Vertex AI Pipelines", text: "Orchestrate end-to-end ML workflows: data prep → feature engineering → training → evaluation → deployment. Based on Kubeflow Pipelines. Reproducible, versioned, scheduled ML workflows." },
          { label: "Model Registry & Endpoints", text: "Model Registry: version, track, and manage trained models. Online Endpoints: real-time predictions, low latency (<100ms target). Batch Predictions: score millions of records offline, cost-efficient, higher throughput." },
          { label: "Vertex AI Workbench", text: "Managed Jupyter notebooks with GCP integrations. For: interactive data exploration, feature engineering, model prototyping. Eliminates notebook infrastructure management." },
        ],
        analogy: "Vertex AI is the wizard academy. AutoML = the academy trains a wizard FOR you ('I need a wizard who can classify dragon types'). Custom Training = you bring your own wizard who knows advanced forbidden spells. Pipelines = the structured curriculum ensuring every wizard follows the same repeatable training program.",
        tip: "Exam distinction: 'Online prediction' = real-time, latency-sensitive (ms). 'Batch prediction' = bulk scoring, cost-efficient, minutes to hours. 'No ML expertise, quick model' → AutoML. 'Custom architecture, full control' → Custom Training.",
      },
      {
        id: "va-2", title: "Feature Store, Embeddings & Vector Search", icon: "🏪", concept: "Serving features consistently and enabling semantic search",
        keyPoints: [
          { label: "Vertex AI Feature Store", text: "Centralized repository for ML features. Store, share, and serve features consistently across training AND serving. Eliminates training/serving skew — the same feature definitions and transformations used in both." },
          { label: "Training/Serving Skew", text: "When features computed differently at training time vs serving time → model degrades silently in production. Root cause: two codepaths computing 'the same' feature differently. Feature Store solves this by sharing one definition." },
          { label: "Text Embeddings", text: "Text Embeddings API converts text/documents to dense numerical vectors (embeddings). Semantically similar content has vectors that are close together in vector space." },
          { label: "Vector Search (RAG pattern)", text: "Store embeddings in Vertex AI Vector Search or BigQuery VECTOR_SEARCH. At query time: embed the user's query → find nearest embedding neighbors → retrieve those documents. Enables semantic search and RAG for LLMs." },
        ],
        analogy: "Feature Store is the royal ingredient pantry: ALL chefs (models) use the SAME pre-measured spices (features) from the central pantry. If each chef measured their own spices differently (training vs serving), the dish would taste different every time. One pantry = consistent results always.",
        tip: "Exam keywords: 'training/serving skew' or 'inconsistent features between training and production' → Feature Store. 'Semantic search on documents' or 'RAG pipeline' → Text Embeddings API + Vector Search. 'Query GCS documents with BigQuery' → BigLake + VECTOR_SEARCH.",
      },
      {
        id: "va-3", title: "ML Architecture Decisions", icon: "⚖️", concept: "Choosing the right ML tool for every exam scenario",
        keyPoints: [
          { label: "BigQuery ML (BQML)", text: "Train ML models WITH SQL directly in BigQuery. No data movement, no infrastructure. Supports: linear/logistic regression, XGBoost, DNN, k-means, ARIMA, matrix factorization. Best when: data already in BigQuery, team knows SQL." },
          { label: "Vertex AutoML Tabular", text: "No-code AutoML for structured data. Google handles feature selection and architecture search. Best when: team lacks deep ML expertise but has good labeled data. More capable than BQML for complex patterns." },
          { label: "Vertex Custom Training", text: "Bring your own training script. Full control over architecture, loss functions, training loop. Best when: cutting-edge research, custom neural architectures, specialized frameworks required." },
          { label: "Low-latency serving pattern", text: "For <10ms serving: batch-compute predictions (BQML or Vertex) → Dataflow materializes results to Bigtable (entity as row key) → application reads from Bigtable. Online endpoints (BigQuery, Vertex) can't reliably hit <10ms at high QPS." },
        ],
        analogy: "BQML = teaching the palace accountant (who has all the books) to do ML in their own language (SQL) without moving a single ledger. AutoML = hiring an ML agency: 'here's my labeled data, give me a model, I don't care how'. Custom Training = building a world-class ML research department from scratch.",
        tip: "Serving latency ladder: Bigtable (<10ms, pre-computed) → Vertex online endpoint (~50-200ms) → BigQuery (~100ms-1s). Match serving to SLA: for <100ms, pre-compute to Bigtable. For batch scoring at scale → Vertex Batch Prediction or BQML + BigQuery export.",
      },
    ],
    questions: [
      { text: "You need to predict customer churn. Data is in BigQuery. Team is comfortable with SQL. You want fast results with minimal infrastructure.", analogy: "👁️ The Specter loves complexity. Simplicity defeats it.", options: ["Export data to GCS, train with Vertex AI Custom Training using TensorFlow", "Use BigQuery ML with CREATE MODEL to train directly in BigQuery using SQL", "Load data into Vertex AI Workbench and train with scikit-learn", "Use Vertex AutoML Tabular with data exported from BigQuery"], correct: 1, explanation: "BigQuery ML trains models using SQL directly where data already lives. Zero data movement, zero infrastructure, SQL-familiar team. Fastest path to a churn model when data is in BigQuery. AutoML also works but requires data export and more setup overhead." },
      { text: "Your ML model performs well in training but degrades in production. Features are computed differently at training time vs serving time. How do you fix this?", options: ["Retrain the model more frequently with fresh data", "Use Vertex AI Feature Store to serve consistent features for both training and serving", "Switch from Custom Training to AutoML for better generalization", "Add more training data to make the model more robust to inconsistencies"], correct: 1, explanation: "Training/serving skew — the exact problem Feature Store solves. By centralizing feature definitions, the SAME transformations are applied at training time AND serving time, eliminating the discrepancy. Retraining frequently doesn't fix two different codepaths computing features differently." },
      { text: "You need to serve ML predictions for millions of users at <10ms latency. Predictions are computed from a BigQuery ML model updated hourly.", options: ["Query BigQuery ML endpoint directly for each user request", "Use Vertex AI online endpoint and call it for each prediction request", "Dataflow job runs hourly to compute predictions → stores in Bigtable (user_id key) → app reads from Bigtable", "Store predictions in Cloud Storage and serve via CDN"], correct: 2, explanation: "For <10ms at millions of QPS: batch-compute predictions hourly (Dataflow + BQML), materialize in Bigtable (user_id row key = O(1) lookup <10ms). BigQuery and Vertex online endpoints both exceed 10ms for high-QPS single-entity lookups. Cloud Storage retrieval also exceeds 10ms." },
      { text: "You want to enable semantic search over millions of internal documents in Cloud Storage. Users search by meaning, not keywords.", options: ["Index documents in BigQuery with LIKE and CONTAINS queries for text search", "Text Embeddings API to vectorize documents → store in Vertex AI Vector Search → query by embedding similarity", "Build a full-text search index with Cloud SQL + trigram indexes", "Use Cloud Natural Language API to extract entities → store in Firestore → query entities"], correct: 1, explanation: "Semantic search requires vector embeddings. Text Embeddings API converts documents to dense vectors. Vertex AI Vector Search finds nearest neighbors by cosine similarity (captures meaning). LIKE and full-text search match only keywords. This is the RAG pattern for grounding LLM responses in your documents." },
      { text: "You are building a clothing recommendation model. User preferences change over time, and new data streams in continuously. How should you train the model with the new data?", analogy: "👁️ The Specter forgets the past — your model must remember both old AND new!", options: ["Continuously retrain the model on ONLY the new data", "Continuously retrain the model on a COMBINATION of existing and new data", "Train on existing data while using new data as the test set only", "Train on new data while using existing data as the test set only"], correct: 1, explanation: "Continuously training on a combination of existing + new data preserves historical patterns while incorporating new trends. Training only on new data causes catastrophic forgetting — the model loses all prior knowledge. Using new data purely as test set means the model never learns from it." },
      { text: "Your financial company stores 50TB of time-series data updated frequently with streaming data. They also want to run existing Apache Hadoop jobs on it. Which product should you use to STORE the data?", options: ["Cloud Bigtable", "Google BigQuery", "Google Cloud Storage", "Google Cloud Datastore"], correct: 0, explanation: "Bigtable is purpose-built for large-scale time-series data with frequent updates and streaming ingestion (single-digit ms latency, millions of ops/sec). BigQuery has high write latency and is for analytics, not high-frequency writes. Cloud Storage is object storage, not a database. Datastore is for transactional entity data." },
      { text: "You need to predict housing prices on a single resource-constrained VM. Which learning algorithm should you use?", options: ["Linear regression", "Logistic classification", "Recurrent neural network", "Feedforward neural network"], correct: 0, explanation: "Linear regression is computationally efficient, works on a single VM with minimal resources, and is purpose-built for predicting continuous values (prices). Logistic regression is for classification (not continuous values). Neural networks (RNN, feedforward) require significantly more compute resources, violating the constraint." },
    ],
  },
  {
    id: "composer", name: "Pipeforge", subtitle: "The Automation Citadel", emoji: "⚙️",
    color: "#F7C948", glow: "#F7C94830", domain: "Cloud Composer, Migrations, Governance & Architecture",
    bossName: "The Broken Pipeline Golem", bossEmoji: "🤖", bossDesc: "Built from failed DAGs and unmonitored jobs. It retries forever.", locked: true,
    lessons: [
      {
        id: "cp-1", title: "Cloud Composer & Airflow DAGs", icon: "🎼", concept: "Orchestrating complex multi-step data pipelines",
        keyPoints: [
          { label: "Cloud Composer = managed Apache Airflow", text: "Write DAGs (Directed Acyclic Graphs) in Python. Define tasks, dependencies, schedules, retries, and alerts. Managed Airflow — no server administration. GCP-native operators for BigQuery, Dataproc, GCS, etc." },
          { label: "BigQueryInsertJobOperator", text: "The CORRECT operator to execute SQL queries/transformations in BigQuery from Composer. Supports retry parameter (number of retries) and email_on_failure=True. This is the exam's preferred operator for BQ SQL." },
          { label: "BigQueryUpsertTableOperator", text: "For creating or UPDATING TABLE METADATA/PROPERTIES (schema, labels, description). NOT for running SQL queries or transformations. Very common exam trap — know the difference!" },
          { label: "Cloud Workflows vs Cloud Composer", text: "Cloud Workflows: lightweight, serverless, HTTP/API-based orchestration, simpler setup. Cloud Composer: complex data pipelines with rich operator library, Airflow ecosystem, retry/SLA monitoring. For simple API chains → Workflows. For data pipeline orchestration → Composer." },
        ],
        analogy: "A DAG is the master recipe for the royal feast: gather ingredients (task 1) → prep (task 2, depends on 1) → cook (task 3, depends on 2). If task 2 fails, retry 3 times. If all fail, send a raven (email_on_failure=True). Cloud Workflows is for simpler missions: 'go to market, if closed try backup market, if both closed send alert'.",
        tip: "Critical trap: BigQuery Scheduled Queries have NO retry parameter and NO email_on_failure. If the exam asks for 'retry + email notification on failure for a BQ SQL job' → must be Cloud Composer + BigQueryInsertJobOperator. Not BigQueryUpsertTableOperator (wrong operator).",
      },
      {
        id: "cp-2", title: "Data Migration & Transfer Services", icon: "🚚", concept: "Moving data to GCP — which service for which scenario",
        keyPoints: [
          { label: "Transfer Appliance", text: "Physical device shipped by Google. Load data on-site, ship device back to Google. Best for: 100TB to PBs when internet upload would take weeks. Completes in hours to days. Secure, encrypted." },
          { label: "Storage Transfer Service", text: "Managed service for transferring data from AWS S3, Azure Blob, HTTP, or another GCS bucket. For: online transfers when bandwidth allows. Scheduled or one-time. Cannot meet 15-min RPO for large backups." },
          { label: "Database Migration Service (DMS)", text: "Managed database migration. Supports: MySQL, PostgreSQL, SQL Server, Oracle → Cloud SQL or AlloyDB. Handles schema conversion, full dump, and CDC for ongoing sync during cutover period." },
          { label: "Datastream", text: "Serverless CDC for ongoing replication (not one-time migration). Continuously syncs changes from Oracle/MySQL/PostgreSQL to BigQuery or GCS. Best for: 'continuous sync with minimum infrastructure management'." },
        ],
        analogy: "Transfer Appliance = armored carriage for 1 PB of gold (internet delivery would take months). Storage Transfer = courier pigeon service (good for manageable amounts). DMS = hiring professional movers who handle the database packing, unpacking, and change-tracking during the move. Datastream = the secret underground tunnel that continuously ferries every change in real time.",
        tip: "'1PB migration in a few hours' → Transfer Appliance (only option at that scale and speed). 'Continuous database sync + minimize infra' → Datastream. 'One-time database migration' → DMS. 'Transfer from AWS/Azure to GCS' → Storage Transfer Service.",
      },
      {
        id: "cp-3", title: "Architectural Decision Framework", icon: "⚖️", concept: "The exam cheat sheet — service selection by keyword",
        keyPoints: [
          { label: "Latency & consistency", text: "Global <10ms → Bigtable. Global ACID consistency → Spanner. Standard relational OLTP → Cloud SQL. Analytics SQL → BigQuery. In-memory cache → Memorystore (Redis)." },
          { label: "Processing & orchestration", text: "Streaming + windowing → Dataflow. SQL ELT in BigQuery → Dataform. Complex pipeline orchestration → Cloud Composer. Simple API/HTTP chain → Cloud Workflows. Existing Spark/Hadoop → Dataproc." },
          { label: "Migration & governance", text: "1PB fast migration → Transfer Appliance. Continuous CDC sync → Datastream. DB migration → DMS. Discovery + lineage + quality → Dataplex. Query lake files with BQ security → BigLake." },
          { label: "The Serverless Rule", text: "When two answers are technically correct, the one using a SERVERLESS/managed service wins over one requiring VM or cluster management. 'Minimize operational overhead' = serverless. This rule resolves many ambiguous exam questions." },
        ],
        analogy: "The decision tree of the kingdom's council: 'Instant response?' → Bigtable. 'Global consistency?' → Spanner. 'SQL analytics?' → BigQuery. 'Real-time stream?' → Pub/Sub + Dataflow. 'Legacy Hadoop?' → Dataproc. 'Find all the data?' → Dataplex. And always: 'managed service without VMs' beats 'self-managed with VMs'.",
        tip: "The most powerful exam skill: read for KEYWORDS. 'Least cost' → cheapest managed service. 'Minimize operational overhead' → serverless wins. 'Near real-time' → streaming (Pub/Sub + Dataflow). 'Lift-and-shift' → Dataproc. 'Global consistency' → Spanner. Two correct answers? Pick the serverless one.",
      },
    ],
    questions: [
      { text: "You need to run a SQL transformation in BigQuery with up to 3 retries and an email notification if all retries fail. What solution?", analogy: "🤖 The Golem keeps breaking pipes. The engineer needs to retry 3 times before calling for help!", options: ["BigQuery scheduled query with Pub/Sub notification after failure", "BigQueryUpsertTableOperator in Cloud Composer, retry=3, email_on_failure=True", "BigQuery scheduled query + Cloud Run function to send email after 3 failures", "BigQueryInsertJobOperator in Cloud Composer, retry=3, email_on_failure=True"], correct: 3, explanation: "BigQueryInsertJobOperator executes SQL transformations in BigQuery. retry=3 retries up to 3 times. email_on_failure=True sends email if all retries exhausted. BigQuery Scheduled Queries have NO retry options. BigQueryUpsertTableOperator is for table schema/metadata — it does NOT run SQL queries." },
      { text: "You need to migrate 1 PB of data from on-premises to Google Cloud. Must complete in a few hours with a secure connection. Google recommended practice?", options: ["gsutil with parallel upload over Dedicated Interconnect", "Cloud VPN + Storage Transfer Service", "Transfer Appliance", "Datastream for bulk data transfer"], correct: 2, explanation: "Transfer Appliance physically transfers 100TB–PBs in hours. Uploading 1PB over even a 10Gbps Dedicated Interconnect would take ~9 days. Storage Transfer Service is for cloud-to-cloud transfers. Datastream is for ongoing CDC, not bulk migration. Transfer Appliance is Google's explicit recommendation at this scale." },
      { text: "A disk I/O intensive Hadoop job runs significantly slower on Cloud Dataproc than on bare-metal. You're using the Cloud Storage connector for all data. How do you fix it?", options: ["Allocate more memory so intermediate data stays in RAM", "Allocate more Persistent Disk; store intermediate Hadoop data on native HDFS instead of Cloud Storage", "Allocate more CPU cores to increase network bandwidth per instance", "Switch all data including intermediate shuffle to Cloud Storage connector"], correct: 1, explanation: "I/O intensive jobs are penalized by Cloud Storage network latency for intermediate shuffle data. Storing intermediate/shuffle data on local HDFS (Persistent Disk) eliminates network round-trips. Input/output data can stay on GCS (separation of storage/compute). Intermediate data needs local disk for I/O performance." },
      { text: "Healthcare data is spread across BigQuery, Cloud Storage, and various databases managed by different owners. Need: data discovery, lineage tracking, and quality validation across all sources without migrating data.", options: ["Build a custom data catalog and discovery tool on GKE", "Use BigLake to convert everything into a unified data lake", "Use Dataplex to manage, discover, and govern data in place", "Use BigQuery Data Transfer Service to centralize all data in BigQuery"], correct: 2, explanation: "Dataplex manages and governs data WHERE IT LIVES — no migration required. It automates discovery across BigQuery, Cloud Storage, and other sources, tracks data lineage, and validates quality. GKE custom tool = expensive and time-consuming. BigLake unifies query access but doesn't provide governance. DTS centralizes with data duplication." },
      { text: "Your pipeline needs to: trigger a Dataproc job, wait for completion, run a BigQuery transformation, then send a notification. Which tool provides the best orchestration?", options: ["Cloud Workflows: lightweight HTTP-based orchestration for this API chain", "Cloud Composer: DAG-based orchestration with native Dataproc and BigQuery operators", "Cloud Scheduler + Cloud Run: trigger each step on a time schedule", "Cloud Functions chained together via Pub/Sub events"], correct: 1, explanation: "Cloud Composer (Airflow) has native operators for Dataproc (DataprocSubmitJobOperator), BigQuery (BigQueryInsertJobOperator), and notifications, with dependency management, retry logic, and SLA monitoring. Cloud Workflows is better for simpler stateless API chains. Scheduler+Run and chained Functions lack complex dependency management for data pipelines." },
      { text: "You need to modernize on-premises Apache Hadoop clusters (with HDFS) and hundreds of Airflow ETL pipelines to Google Cloud, with minimal changes to orchestration. What should you do?", analogy: "🤖 The Golem is built from legacy Hadoop bones — don't rebuild, just lift and shift!", options: ["Dataproc for Hadoop + Cloud Storage for HDFS + convert ETL pipelines to Dataflow", "Dataproc for Hadoop + Cloud Storage for HDFS + orchestrate with Cloud Composer", "Bigtable for large workloads + Cloud Storage for HDFS + Cloud Composer for orchestration", "Dataproc for Hadoop + Cloud Storage for HDFS + Cloud Data Fusion for ETL pipelines"], correct: 1, explanation: "Dataproc = lift-and-shift Hadoop. Cloud Storage = replaces HDFS. Cloud Composer = managed Apache Airflow (minimal changes to existing orchestration — same DAGs!). Dataflow would require rewriting all pipelines (not minimal changes). Bigtable doesn't replace Hadoop compute. Data Fusion is code-free ETL, not an orchestration tool." },
      { text: "You orchestrate ETL pipelines with Cloud Composer. One Airflow DAG task relies on a third-party service. You want to be notified specifically when that task FAILS (not retries, not SLA miss). What should you do?", options: ["Assign a function with notification logic to the on_failure_callback parameter of the operator", "Assign a function with notification logic to the sla_miss_callback parameter of the operator", "Assign a function with notification logic to the on_retry_callback parameter of the operator", "Configure a Cloud Monitoring alert on the sla_missed metric for that task"], correct: 0, explanation: "on_failure_callback fires specifically when a task fails — exactly what's needed. sla_miss_callback fires when the task misses its SLA window (not necessarily a failure). on_retry_callback fires on retry attempts (not the final failure). Cloud Monitoring sla_missed is a different signal and requires extra configuration." },
      { text: "You need to use Python's standard library for complex business logic in a Cloud Workflows step, but Workflows' standard library is insufficient. You want simplicity and fast execution. What should you do?", options: ["Create a Dataproc cluster, use PySpark to apply the logic", "Invoke a Cloud Run function instance that uses Python to apply the logic", "Invoke a subworkflow in Workflows to apply the logic", "Create a Cloud Composer environment and run the logic there"], correct: 1, explanation: "Cloud Run functions spin up instantly, support Python standard library, and integrate natively with Cloud Workflows via HTTP invocation. Dataproc is massive overhead for a 1KB JSON transformation. A Workflows subworkflow still uses the Workflows stdlib (doesn't solve the problem). Cloud Composer is overkill and not optimized for simplicity." },
      { text: "You have terabytes of Google Analytics behavioral data in BigQuery daily. Customer preferences are in Cloud SQL (MySQL + PostgreSQL). Marketing runs campaigns 100-300x/day. You must minimize load on Cloud SQL databases. What should you do?", options: ["Create BigQuery connections to both Cloud SQL databases and use federated queries", "Create a Dataproc cluster with Trino to connect to Cloud SQL and BigQuery", "Create Datastream streams to replicate required tables from both Cloud SQL databases to BigQuery", "Use Dataproc Serverless with Spark to query both Cloud SQL databases and BigQuery"], correct: 2, explanation: "Datastream (CDC) replicates Cloud SQL tables into BigQuery continuously — queries run entirely in BigQuery, zero load on Cloud SQL. Federated queries scan Cloud SQL directly each time (100-300 full scans/day = huge load). Trino and Serverless Spark both load data from Cloud SQL into compute, still hitting the databases." },
    ],
  },
];

const XP_LESSON = 50;
const XP_CORRECT = 100;
const XP_WRONG = 15;

function Stars() {
  const s = Array.from({ length: 100 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, sz: Math.random() * 2 + 0.3, d: Math.random() * 5, dur: 2 + Math.random() * 4 }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {s.map(({ id, x, y, sz, d, dur }) => (<div key={id} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: sz, height: sz, borderRadius: "50%", background: "#fff", animation: `twkl ${dur}s ${d}s infinite alternate` }} />))}
      <div style={{ position: "absolute", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, #0d1b4e33 0%, transparent 70%)", top: "10%", left: "60%", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: "30vw", height: "30vw", borderRadius: "50%", background: "radial-gradient(circle, #1a0d3a33 0%, transparent 70%)", bottom: "20%", left: "10%", filter: "blur(60px)" }} />
    </div>
  );
}

function XPBar({ xp, level }) {
  const needed = level * 500; const cur = xp % needed;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "#F7C948", fontSize: 11, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>Lv.{level}</span>
      <div style={{ flex: 1, height: 6, background: "#0a0f1e", borderRadius: 99, overflow: "hidden", border: "1px solid #1a2040" }}>
        <div style={{ height: "100%", width: `${(cur / needed) * 100}%`, background: "linear-gradient(90deg, #F7C948, #f97316)", borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ color: "#374151", fontSize: 10, fontFamily: "monospace" }}>{xp}xp</span>
    </div>
  );
}

function CharacterSelect({ onSelect }) {
  const [hovered, setHovered] = useState(null); const [selected, setSelected] = useState(null); const [customName, setCustomName] = useState("");
  const handlePick = (c) => { if (c.id === "custom" && !customName.trim()) return; onSelect({ ...c, name: c.id === "custom" ? customName.trim() : c.name }); };
  return (
    <div style={{ animation: "fadeUp 0.6s ease", maxWidth: 860, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#374151", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>✦ WHO WALKS THE SCORPIO SKY? ✦</div>
        <h2 style={{ fontSize: "clamp(20px,4vw,34px)", fontWeight: 800, color: "#e5e7eb", letterSpacing: 2, marginBottom: 8 }}>CHOOSE YOUR HERO</h2>
        <p style={{ color: "#4b5563", fontSize: 13, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>Five sky-cities float above Scorpio's constellation. Only a true Data Architect unlocks their secrets.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 16, marginBottom: 32 }}>
        {CHARACTERS.map(c => {
          const active = hovered === c.id || selected === c.id;
          return (
            <div key={c.id} onClick={() => setSelected(c.id)} onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              style={{ borderRadius: 20, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: active ? "rgba(17,24,39,0.98)" : "rgba(17,24,39,0.7)", border: `2px solid ${active ? c.color : c.color + "33"}`, transition: "all 0.3s", transform: active ? "translateY(-8px) scale(1.03)" : "none", boxShadow: active ? `0 20px 60px ${c.color}20` : "none" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{c.art}</div>
              <div style={{ color: active ? c.accent || c.color : c.color, fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
              <div style={{ color: "#4b5563", fontSize: 10, marginBottom: 8, fontFamily: "monospace" }}>{c.origin}</div>
              <div style={{ color: "#374151", fontSize: 11, lineHeight: 1.5 }}>{c.desc}</div>
              {c.id === "custom" && selected === "custom" && (<input value={customName} onChange={e => setCustomName(e.target.value)} onClick={e => e.stopPropagation()} placeholder="Your name..." style={{ marginTop: 12, width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid ${c.color}44`, borderRadius: 8, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, outline: "none", fontFamily: "monospace" }} />)}
            </div>
          );
        })}
      </div>
      {selected && (<div style={{ textAlign: "center", animation: "fadeUp 0.4s" }}><button onClick={() => handlePick(CHARACTERS.find(c => c.id === selected))} style={{ padding: "16px 48px", background: `linear-gradient(135deg, ${CHARACTERS.find(c => c.id === selected)?.color}, ${CHARACTERS.find(c => c.id === selected)?.color}99)`, border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: 2 }}>BEGIN THE JOURNEY ⚔️</button></div>)}
    </div>
  );
}

function WorldMap({ cities, hero, xp, level, completedLessons, completedChallenges, onCityClick, onChangeHero, onTrainingMode }) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div><div style={{ color: hero.color, fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{hero.art} {hero.name}</div><div style={{ maxWidth: 260 }}><XPBar xp={xp} level={level} /></div></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={onTrainingMode} style={{ background: "rgba(0,201,167,0.1)", border: "1px solid #00C9A744", borderRadius: 10, color: "#00C9A7", padding: "8px 16px", cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>🎯 Training Mode</button>
          <button onClick={onChangeHero} style={{ background: "rgba(17,24,39,0.8)", border: "1px solid #1a2040", borderRadius: 10, color: "#6b7280", padding: "8px 16px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>← Change Hero</button>
        </div>
      </div>
      <div style={{ textAlign: "center", color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3, marginBottom: 24 }}>✦ THE SCORPIO SKY CITIES ✦</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20, marginBottom: 32 }}>
        {cities.map(city => {
          const lessonsComplete = city.lessons.filter(l => completedLessons.has(l.id)).length;
          const challengeDone = completedChallenges.has(city.id); const unlocked = !city.locked;
          const pct = city.lessons.length > 0 ? Math.round((lessonsComplete / city.lessons.length) * 100) : 0;
          return (
            <div key={city.id} onClick={() => unlocked && onCityClick(city)}
              style={{ borderRadius: 20, padding: "24px", cursor: unlocked ? "pointer" : "not-allowed", background: "rgba(10,15,30,0.9)", border: `1.5px solid ${unlocked ? city.color + "55" : "#1a2040"}`, opacity: unlocked ? 1 : 0.4, transition: "all 0.3s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { if (unlocked) { e.currentTarget.style.borderColor = city.color; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 60px ${city.glow}`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = unlocked ? city.color + "55" : "#1a2040"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              {unlocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#0a0f1e" }}><div style={{ height: "100%", width: `${pct}%`, background: city.color, transition: "width 0.8s" }} /></div>}
              {!unlocked && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 14 }}>🔒</div>}
              {challengeDone && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 14 }}>🏆</div>}
              <div style={{ fontSize: 36, marginBottom: 10 }}>{city.emoji}</div>
              <div style={{ color: city.color, fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{city.name}</div>
              <div style={{ color: "#374151", fontSize: 10, marginBottom: 8, fontFamily: "monospace" }}>{city.subtitle}</div>
              <div style={{ color: "#4b5563", fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{city.domain}</div>
              {unlocked && (<div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: city.color + "aa", fontSize: 10, fontFamily: "monospace" }}>{lessonsComplete}/{city.lessons.length} lessons</span><span style={{ color: "#374151", fontSize: 10, fontFamily: "monospace" }}>{challengeDone ? "✓ CLEARED" : "BOSS AWAITS"}</span></div>)}
            </div>
          );
        })}
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
        <h2 style={{ color: city.color, fontWeight: 800, fontSize: 24, letterSpacing: 2, marginBottom: 4 }}>{city.name}</h2>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", marginBottom: 6 }}>{city.subtitle.toUpperCase()}</div>
        <div style={{ color: "#4b5563", fontSize: 13 }}>{city.domain}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ height: 1, flex: 1, background: "#1a2040" }} /><span style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3 }}>STUDY TRAIL</span><div style={{ height: 1, flex: 1, background: "#1a2040" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {city.lessons.map((lesson, idx) => {
          const done = completedLessons.has(lesson.id); const prev = idx === 0 || completedLessons.has(city.lessons[idx - 1].id);
          return (
            <div key={lesson.id} onClick={() => prev && onLesson(lesson)}
              style={{ borderRadius: 16, padding: "18px 20px", cursor: prev ? "pointer" : "not-allowed", background: "rgba(10,15,30,0.9)", border: `1.5px solid ${done ? city.color + "88" : prev ? city.color + "33" : "#1a2040"}`, opacity: prev ? 1 : 0.4, transition: "all 0.3s", display: "flex", alignItems: "center", gap: 16 }}
              onMouseEnter={e => { if (prev) e.currentTarget.style.borderColor = city.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = done ? city.color + "88" : prev ? city.color + "33" : "#1a2040"; }}>
              <div style={{ fontSize: 26, width: 44, textAlign: "center" }}>{done ? "✅" : lesson.icon}</div>
              <div style={{ flex: 1 }}><div style={{ color: done ? city.color : "#e5e7eb", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{lesson.title}</div><div style={{ color: "#4b5563", fontSize: 12 }}>{lesson.concept}</div></div>
              <div style={{ color: city.color + "88", fontSize: 11, fontFamily: "monospace" }}>{done ? `✓ ${XP_LESSON}xp` : prev ? "→" : "🔒"}</div>
            </div>
          );
        })}
      </div>
      <div style={{ borderRadius: 20, padding: "28px", background: "rgba(10,15,30,0.95)", border: `2px solid ${allLessonsDone ? city.color : "#1a2040"}`, opacity: allLessonsDone ? 1 : 0.5, textAlign: "center", transition: "all 0.5s", boxShadow: allLessonsDone ? `0 0 40px ${city.glow}` : "none" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{completedChallenge ? "🌟" : allLessonsDone ? city.bossEmoji : "🌀"}</div>
        <div style={{ color: allLessonsDone ? city.color : "#374151", fontWeight: 800, fontSize: 18, marginBottom: 6, letterSpacing: 1 }}>{completedChallenge ? "CITY CONQUERED!" : allLessonsDone ? `BOSS: ${city.bossName}` : "PORTAL SEALED"}</div>
        <div style={{ color: "#4b5563", fontSize: 13, marginBottom: allLessonsDone ? 20 : 0, lineHeight: 1.6 }}>{completedChallenge ? `${hero.name} has mastered ${city.name}.` : allLessonsDone ? city.bossDesc : "Complete all study lessons to unseal the portal."}</div>
        {allLessonsDone && !completedChallenge && (<button onClick={onChallenge} style={{ padding: "14px 36px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", letterSpacing: 1 }}>⚔️ FACE THE BOSS</button>)}
        {completedChallenge && (<button onClick={onBack} style={{ padding: "14px 36px", background: "rgba(247,201,72,0.15)", border: "1px solid #F7C94866", borderRadius: 14, color: "#F7C948", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🗺️ Return to World Map</button>)}
      </div>
    </div>
  );
}

function LessonView({ lesson, city, hero, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const total = lesson.keyPoints.length + 2;
  const goBack = () => { if (step > 0) setStep(s => s - 1); else onBack(); };
  return (
    <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={goBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace", whiteSpace: "nowrap" }}>← {step === 0 ? city.name : "Back"}</button>
        <div style={{ flex: 1 }}><div style={{ color: city.color, fontWeight: 800, fontSize: 16 }}>{lesson.icon} {lesson.title}</div><div style={{ color: "#4b5563", fontSize: 11, fontFamily: "monospace" }}>{lesson.concept}</div></div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {Array.from({ length: total }).map((_, i) => (<div key={i} onClick={() => i < step && setStep(i)} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? city.color : i === step ? city.color + "66" : "#1a2040", transition: "background 0.4s", cursor: i < step ? "pointer" : "default" }} />))}
      </div>
      <div style={{ borderRadius: 20, padding: "32px 28px", background: "rgba(10,15,30,0.95)", border: `1.5px solid ${city.color}33`, marginBottom: 24, minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center" }} key={step}>
        {step < lesson.keyPoints.length && (<><div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>KEY CONCEPT {step + 1}/{lesson.keyPoints.length}</div><div style={{ color: city.color, fontWeight: 800, fontSize: 18, marginBottom: 14 }}>{lesson.keyPoints[step].label}</div><div style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.8 }}>{lesson.keyPoints[step].text}</div></>)}
        {step === lesson.keyPoints.length && (<><div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>🗺️ {hero.name.toUpperCase()} ENCOUNTERS AN ELDER</div><div style={{ color: "#9ca3af", fontSize: 14, fontStyle: "italic", lineHeight: 1.8, background: `${city.color}0a`, border: `1px solid ${city.color}22`, borderRadius: 12, padding: "16px 20px" }}>"{lesson.analogy}"</div></>)}
        {step === lesson.keyPoints.length + 1 && (<><div style={{ fontSize: 11, color: "#F7C948aa", fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>⚡ EXAM TIP</div><div style={{ color: "#F7C948", fontWeight: 700, fontSize: 15, lineHeight: 1.8, background: "#F7C9480a", border: "1px solid #F7C94822", borderRadius: 12, padding: "16px 20px" }}>{lesson.tip}</div><div style={{ color: "#4b5563", fontSize: 12, marginTop: 16, fontFamily: "monospace" }}>+{XP_LESSON} XP on completion</div></>)}
      </div>
      {step < total - 1
        ? <button onClick={() => setStep(s => s + 1)} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{step < lesson.keyPoints.length ? "Next Concept →" : "See the Exam Tip →"}</button>
        : <button onClick={onComplete} style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>✨ Complete Lesson — Claim +{XP_LESSON} XP</button>}
    </div>
  );
}

function BossFight({ city, hero, onComplete, onBack }) {
  const [idx, setIdx] = useState(0); const [selected, setSelected] = useState(null); const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false); const [shake, setShake] = useState(false);
  const q = city.questions[idx];
  const pick = (i) => { if (answered) return; setSelected(i); setAnswered(true); if (i === q.correct) setScore(s => s + 1); else { setShake(true); setTimeout(() => setShake(false), 600); } };
  const next = () => { if (idx + 1 >= city.questions.length) setDone(true); else { setIdx(i => i + 1); setSelected(null); setAnswered(false); } };
  if (done) {
    const pct = Math.round((score / city.questions.length) * 100); const won = pct >= 60;
    const gained = score * XP_CORRECT + (city.questions.length - score) * XP_WRONG;
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 560, margin: "0 auto", animation: "fadeUp 0.5s" }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>{won ? "🏆" : "💪"}</div>
        <div style={{ fontWeight: 800, fontSize: 26, color: won ? "#F7C948" : city.color, marginBottom: 10, letterSpacing: 2 }}>{won ? `${city.bossName} DEFEATED!` : "KEEP TRAINING!"}</div>
        <div style={{ color: "#6b7280", fontSize: 16, marginBottom: 8 }}>{score}/{city.questions.length} correct — {pct}%</div>
        <div style={{ color: "#F7C948", fontSize: 14, marginBottom: 32, fontFamily: "monospace" }}>+{gained} XP ⚡</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onComplete(score, city.questions.length)} style={{ padding: "14px 36px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🗺️ World Map</button>
          {!won && <button onClick={() => { setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); }} style={{ padding: "14px 28px", background: "rgba(247,201,72,0.1)", border: "1px solid #F7C94844", borderRadius: 14, color: "#F7C948", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 Try Again</button>}
        </div>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>← RETREAT</button>
        <span style={{ color: city.color, fontWeight: 800, fontSize: 13 }}>{city.bossEmoji} {city.bossName}</span>
        <span style={{ color: "#F7C948", fontFamily: "monospace", fontSize: 12 }}>⚔️ {score}/{city.questions.length}</span>
      </div>
      <div style={{ height: 6, background: "#0a0f1e", borderRadius: 99, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${100 - (idx / city.questions.length) * 100}%`, background: "linear-gradient(90deg, #ef4444, #F7C948)", borderRadius: 99, transition: "width 0.6s" }} />
      </div>
      {q.analogy && <div style={{ background: `${city.color}0d`, border: `1px solid ${city.color}22`, borderRadius: 12, padding: "12px 16px", marginBottom: 18, color: "#6b7280", fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>{q.analogy}</div>}
      <div style={{ color: "#f3f4f6", fontSize: 16, lineHeight: 1.8, marginBottom: 22, fontWeight: 500, animation: shake ? "shakeEl 0.5s" : "none" }}>{q.text}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.02)", border = "#1a2040", color = "#9ca3af";
          if (answered) { if (i === q.correct) { bg = "rgba(0,201,167,0.1)"; border = "#00C9A7"; color = "#00C9A7"; } else if (i === selected) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; } }
          return (<button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 18px", color, fontSize: 14, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "all 0.2s", lineHeight: 1.5 }}
            onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = city.color + "88"; e.currentTarget.style.color = "#e5e7eb"; } }}
            onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = "#1a2040"; e.currentTarget.style.color = "#9ca3af"; } }}>
            <span style={{ opacity: 0.3, marginRight: 10, fontFamily: "monospace" }}>{String.fromCharCode(65 + i)}.</span>{opt}
          </button>);
        })}
      </div>
      {answered && (<div style={{ background: selected === q.correct ? "rgba(0,201,167,0.06)" : "rgba(247,201,72,0.06)", border: `1px solid ${selected === q.correct ? "#00C9A733" : "#F7C94833"}`, borderRadius: 14, padding: "18px 20px", color: "#d1d5db", fontSize: 13, lineHeight: 1.8, marginBottom: 18, animation: "fadeUp 0.4s" }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: selected === q.correct ? "#00C9A7" : "#F7C948" }}>{selected === q.correct ? "✨ Spell mastered!" : "📖 Learn the spell:"}</div>
        {q.explanation}
      </div>)}
      {answered && (<button onClick={next} style={{ width: "100%", padding: 16, background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", animation: "fadeUp 0.3s" }}>{idx + 1 >= city.questions.length ? "⚔️ Finish Battle" : "Next Attack →"}</button>)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MODE SELECT — Adventure vs Training
// ═══════════════════════════════════════════════════════════
function ModeSelect({ onAdventure, onTraining }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ animation: "fadeUp 0.6s ease", maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#374151", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>✦ CHOOSE YOUR PATH ✦</div>
        <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>Two paths lead to certification mastery. Which calls to you?</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { id: "adventure", emoji: "⚔️", title: "ADVENTURE", sub: "RPG Mode", desc: "Explore 5 sky-cities, study lessons, defeat bosses, unlock new regions. The full journey.", color: "#F7C948", onClick: onAdventure },
          { id: "training", emoji: "🎯", title: "TRAINING", sub: "Exam Drill Mode", desc: "Pick your domains, choose how many questions, and drill with the full question bank.", color: "#00C9A7", onClick: onTraining },
        ].map(m => (
          <div key={m.id} onClick={m.onClick} onMouseEnter={() => setHov(m.id)} onMouseLeave={() => setHov(null)}
            style={{ borderRadius: 24, padding: "36px 28px", textAlign: "center", cursor: "pointer", background: "rgba(10,15,30,0.95)", border: `2px solid ${hov === m.id ? m.color : m.color + "33"}`, transition: "all 0.3s", transform: hov === m.id ? "translateY(-8px)" : "none", boxShadow: hov === m.id ? `0 20px 60px ${m.color}22` : "none" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{m.emoji}</div>
            <div style={{ color: m.color, fontWeight: 900, fontSize: 18, letterSpacing: 3, marginBottom: 4 }}>{m.title}</div>
            <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", marginBottom: 14, letterSpacing: 2 }}>{m.sub}</div>
            <div style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.7 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRAINING SETUP — hero + domain filter + quantity
// ═══════════════════════════════════════════════════════════
const CITY_META = { bigquery: { id: "bigquery", name: "Querythas", color: "#4A90E2", emoji: "🏰" }, dataflow: { id: "dataflow", name: "Streamhaven", color: "#00C9A7", emoji: "🌊" }, storage: { id: "storage", name: "The Vault", color: "#E05C5C", emoji: "🗝️" }, vertex: { id: "vertex", name: "Oracle Spire", color: "#A259FF", emoji: "🔮" }, composer: { id: "composer", name: "Pipeforge", color: "#F7C948", emoji: "⚙️" } };

function TrainingSetup({ hero, onStart, onBack, onChangeHero, onGoAdventure, externalQuestions }) {
  const [selectedDomains, setSelectedDomains] = useState(new Set(CITIES.map(c => c.id)));
  const [qty, setQty] = useState(20);

  // Questões internas (do jogo)
  const internalQs = CITIES.flatMap(c => c.questions.map(q => ({ ...q, cityId: c.id, cityName: c.name, cityColor: c.color, cityEmoji: c.emoji })));
  // Questões externas (do JSON), normaliza o formato
  const externalQs = (externalQuestions || []).map(q => {
    const meta = CITY_META[q.domain] || { id: q.domain, name: q.domain, color: "#6b7280", emoji: "📋" };
    return { ...q, cityId: meta.id, cityName: meta.name, cityColor: meta.color, cityEmoji: meta.emoji };
  });
  // Deduplica por texto (evita duplicar questões que já existem nos dois bancos)
  const internalTexts = new Set(internalQs.map(q => q.text.slice(0, 60)));
  const uniqueExternal = externalQs.filter(q => !internalTexts.has(q.text.slice(0, 60)));
  const allQuestions = [...internalQs, ...uniqueExternal];

  const available = allQuestions.filter(q => selectedDomains.has(q.cityId));
  const maxQty = available.length;
  const actualQty = Math.min(qty, maxQty);

  const toggleDomain = (id) => {
    setSelectedDomains(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const handleStart = () => {
    const pool = available.sort(() => Math.random() - 0.5).slice(0, actualQty);
    onStart(pool);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {hero && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: hero.color, fontWeight: 700 }}>{hero.art} {hero.name}</span>
              <button onClick={onChangeHero} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>change</button>
            </div>
          )}
          <button onClick={onGoAdventure} style={{ background: "rgba(247,201,72,0.08)", border: "1px solid #F7C94844", borderRadius: 8, color: "#F7C948", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>⚔️ Jornada</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
        <h2 style={{ color: "#00C9A7", fontWeight: 800, fontSize: 22, letterSpacing: 2, marginBottom: 6 }}>TRAINING MODE</h2>
        <p style={{ color: "#4b5563", fontSize: 13 }}>Configure your drill session</p>
      </div>

      {/* Domain Filter */}
      <div style={{ background: "rgba(10,15,30,0.9)", border: "1px solid #1a2040", borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>SELECT DOMAINS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CITIES.map(city => {
            const on = selectedDomains.has(city.id);
            return (
              <div key={city.id} onClick={() => toggleDomain(city.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, cursor: "pointer", background: on ? `${city.color}0f` : "transparent", border: `1.5px solid ${on ? city.color + "66" : "#1a2040"}`, transition: "all 0.2s" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: on ? city.color : "transparent", border: `2px solid ${on ? city.color : "#374151"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{on ? "✓" : ""}</div>
                <span style={{ fontSize: 18 }}>{city.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: on ? city.color : "#6b7280", fontWeight: 700, fontSize: 13 }}>{city.name}</div>
                  <div style={{ color: "#374151", fontSize: 11 }}>{city.domain}</div>
                </div>
                <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace" }}>{city.questions.length}q</div>
              </div>
            );
          })}
        </div>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", marginTop: 12, textAlign: "right" }}>{available.length} questions available</div>
      </div>

      {/* Quantity */}
      <div style={{ background: "rgba(10,15,30,0.9)", border: "1px solid #1a2040", borderRadius: 16, padding: "20px 22px", marginBottom: 28 }}>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>HOW MANY QUESTIONS?</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[20, 50, 100, 150, 200].map(n => {
            const disabled = n > maxQty;
            const active = qty === n && !disabled;
            return (
              <button key={n} onClick={() => !disabled && setQty(n)} disabled={disabled}
                style={{ padding: "10px 20px", borderRadius: 10, border: `2px solid ${active ? "#00C9A7" : disabled ? "#0f1a2e" : "#1a2040"}`, background: active ? "rgba(0,201,167,0.12)" : "transparent", color: active ? "#00C9A7" : disabled ? "#1a2040" : "#6b7280", fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "monospace" }}>
                {n}
              </button>
            );
          })}
        </div>
        <div style={{ color: "#4b5563", fontSize: 12, marginTop: 12 }}>
          {actualQty} random questions from {selectedDomains.size} domain{selectedDomains.size !== 1 ? "s" : ""}
        </div>
      </div>

      <button onClick={handleStart} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #00C9A7, #00C9A799)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: 1 }}>
        🎯 START TRAINING — {actualQty} Questions
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRAINING SESSION — suporta single e multi-select
// ═══════════════════════════════════════════════════════════
function TrainingSession({ questions, hero, onComplete, onBack, onGoAdventure }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(new Set()); // sempre Set
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [shake, setShake] = useState(false);

  const q = questions[idx];

  // Normaliza: correct pode ser number, array de numbers, ou string "1,2"
  const correctSet = (() => {
    const c = q.correct;
    if (Array.isArray(c)) return new Set(c);
    if (typeof c === "string" && c.includes(",")) return new Set(c.split(",").map(Number));
    return new Set([Number(c)]);
  })();
  const isMulti = correctSet.size > 1;
  const requiredCount = correctSet.size;

  const toggle = (i) => {
    if (answered) return;
    if (!isMulti) {
      // Single: responde imediatamente
      const correct = correctSet.has(i);
      if (!correct) { setShake(true); setTimeout(() => setShake(false), 600); }
      setSelected(new Set([i]));
      setAnswered(true);
    } else {
      // Multi: acumula seleções até atingir o número necessário
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(i)) { next.delete(i); }
        else { next.add(i); }
        return next;
      });
    }
  };

  // Para multi: botão confirmar aparece quando selecionou o número certo
  const confirmMulti = () => {
    if (answered) return;
    const correct = [...correctSet].every(i => selected.has(i)) && selected.size === correctSet.size;
    if (!correct) { setShake(true); setTimeout(() => setShake(false), 600); }
    setAnswered(true);
  };

  const isCorrect = answered && [...correctSet].every(i => selected.has(i)) && selected.size === correctSet.size;

  const next = () => {
    const newResults = [...results, { q, selected: [...selected], correct: isCorrect }];
    if (idx + 1 >= questions.length) { onComplete(newResults); }
    else { setResults(newResults); setIdx(i => i + 1); setSelected(new Set()); setAnswered(false); }
  };

  const score = results.filter(r => r.correct).length;
  const pct = questions.length > 0 ? Math.round((idx / questions.length) * 100) : 0;

  // Domínio da questão — pode vir do CITIES (questões do jogo) ou do JSON externo
  const cityMeta = { bigquery: { emoji: "🏰", color: "#4A90E2", name: "BigQuery" }, dataflow: { emoji: "🌊", color: "#00C9A7", name: "Dataflow" }, storage: { emoji: "🗝️", color: "#E05C5C", name: "Storage" }, vertex: { emoji: "🔮", color: "#A259FF", name: "Vertex AI" }, composer: { emoji: "⚙️", color: "#F7C948", name: "Composer" } };
  const meta = q.cityEmoji ? { emoji: q.cityEmoji, color: q.cityColor, name: q.cityName } : (cityMeta[q.domain] || { emoji: "📋", color: "#6b7280", name: q.domain });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>✕ Exit</button>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ color: "#00C9A7", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>✓ {score}</span>
          <span style={{ color: "#ef4444", fontFamily: "monospace", fontSize: 13 }}>✗ {idx - score}</span>
          <span style={{ color: "#374151", fontFamily: "monospace", fontSize: 12 }}>{idx + 1}/{questions.length}</span>
          <button onClick={onGoAdventure} style={{ background: "rgba(247,201,72,0.08)", border: "1px solid #F7C94844", borderRadius: 8, color: "#F7C948", padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>⚔️ Jornada</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "#0a0f1e", borderRadius: 99, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #00C9A7, #4A90E2)", borderRadius: 99, transition: "width 0.5s" }} />
      </div>

      {/* Domain badge + multi hint */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 16 }}>{meta.emoji}</span>
        <span style={{ color: meta.color, fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2 }}>{meta.name.toUpperCase()}</span>
        {isMulti && (
          <span style={{ background: "rgba(247,201,72,0.12)", border: "1px solid #F7C94844", borderRadius: 6, color: "#F7C948", fontSize: 11, fontFamily: "monospace", padding: "2px 8px" }}>
            ✦ SELECIONE {requiredCount} RESPOSTAS ({selected.size}/{requiredCount})
          </span>
        )}
      </div>

      {/* Question */}
      <div style={{ color: "#f3f4f6", fontSize: 15, lineHeight: 1.85, marginBottom: 22, fontWeight: 500, animation: shake ? "shakeEl 0.5s" : "none" }}>{q.text}</div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          const isCorrectOpt = correctSet.has(i);
          const isSelectedOpt = selected.has(i);
          let bg = "rgba(255,255,255,0.02)", border = "#1a2040", color = "#9ca3af";
          if (answered) {
            if (isCorrectOpt) { bg = "rgba(0,201,167,0.1)"; border = "#00C9A7"; color = "#00C9A7"; }
            else if (isSelectedOpt) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; }
          } else if (isSelectedOpt) {
            bg = "rgba(74,144,226,0.1)"; border = "#4A90E2"; color = "#93c5fd";
          }
          return (
            <button key={i} onClick={() => toggle(i)}
              style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 18px", color, fontSize: 14, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "all 0.2s", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 10 }}
              onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = "#4A90E288"; e.currentTarget.style.color = "#e5e7eb"; } }}
              onMouseLeave={e => { if (!answered && !isSelectedOpt) { e.currentTarget.style.borderColor = "#1a2040"; e.currentTarget.style.color = "#9ca3af"; } }}>
              {/* Checkbox visual para multi */}
              {isMulti && (
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${answered ? (isCorrectOpt ? "#00C9A7" : isSelectedOpt ? "#ef4444" : "#374151") : isSelectedOpt ? "#4A90E2" : "#374151"}`, background: isSelectedOpt ? (answered ? (isCorrectOpt ? "#00C9A7" : "#ef4444") : "#4A90E2") : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {isSelectedOpt && "✓"}
                </div>
              )}
              {!isMulti && <span style={{ opacity: 0.3, fontFamily: "monospace", flexShrink: 0 }}>{String.fromCharCode(65 + i)}.</span>}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Botão confirmar (só multi, antes de responder) */}
      {isMulti && !answered && (
        <button onClick={confirmMulti} disabled={selected.size !== requiredCount}
          style={{ width: "100%", padding: 14, background: selected.size === requiredCount ? "linear-gradient(135deg, #4A90E2, #4A90E299)" : "rgba(74,144,226,0.05)", border: `1px solid ${selected.size === requiredCount ? "#4A90E2" : "#1a2040"}`, borderRadius: 14, color: selected.size === requiredCount ? "#fff" : "#374151", fontWeight: 700, fontSize: 14, cursor: selected.size === requiredCount ? "pointer" : "not-allowed", marginBottom: 16, transition: "all 0.3s" }}>
          {selected.size === requiredCount ? "✓ Confirmar Seleção" : `Selecione mais ${requiredCount - selected.size} resposta(s)`}
        </button>
      )}

      {/* Explanation */}
      {answered && (
        <div style={{ background: isCorrect ? "rgba(0,201,167,0.06)" : "rgba(247,201,72,0.06)", border: `1px solid ${isCorrect ? "#00C9A733" : "#F7C94833"}`, borderRadius: 14, padding: "18px 20px", color: "#d1d5db", fontSize: 13, lineHeight: 1.8, marginBottom: 18, animation: "fadeUp 0.4s" }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: isCorrect ? "#00C9A7" : "#F7C948" }}>{isCorrect ? "✨ Correto!" : "📖 Estude isso:"}</div>
          {q.explanation
            ? q.explanation
            : <span style={{ color: "#4b5563", fontStyle: "italic" }}>Resposta correta: {[...correctSet].map(i => String.fromCharCode(65 + i)).join(", ")} — {[...correctSet].map(i => q.options[i]).join(" / ")}</span>
          }
        </div>
      )}

      {answered && (
        <button onClick={next} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #00C9A7, #00C9A799)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", animation: "fadeUp 0.3s" }}>
          {idx + 1 >= questions.length ? "📊 Ver Resultados" : "Próxima →"}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRAINING REPORT — detailed results
// ═══════════════════════════════════════════════════════════
function TrainingReport({ results, hero, onRetry, onBack, xpGained }) {
  const [showWrong, setShowWrong] = useState(false);
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const wrong = results.filter(r => !r.correct);
  const pct = Math.round((correct / total) * 100);

  // Per domain stats
  const byDomain = {};
  results.forEach(r => {
    const key = r.q.cityId;
    if (!byDomain[key]) byDomain[key] = { name: r.q.cityName, color: r.q.cityColor, emoji: r.q.cityEmoji, correct: 0, total: 0 };
    byDomain[key].total++;
    if (r.correct) byDomain[key].correct++;
  });

  const grade = pct >= 80 ? { label: "EXAM READY! 🏆", color: "#F7C948" } : pct >= 60 ? { label: "ALMOST THERE 💪", color: "#00C9A7" } : { label: "KEEP DRILLING 📖", color: "#f97316" };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      {/* Score header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "💪" : "📖"}</div>
        <div style={{ fontWeight: 900, fontSize: 26, color: grade.color, marginBottom: 6, letterSpacing: 2 }}>{grade.label}</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#e5e7eb", fontFamily: "monospace", marginBottom: 4 }}>{pct}%</div>
        <div style={{ color: "#6b7280", fontSize: 15, marginBottom: 6 }}>{correct}/{total} correct</div>
        <div style={{ color: "#F7C948", fontFamily: "monospace", fontSize: 14 }}>+{xpGained} XP earned ⚡</div>
        {hero && <div style={{ color: hero.color, fontSize: 13, marginTop: 4 }}>{hero.art} {hero.name}</div>}
      </div>

      {/* Per domain breakdown */}
      <div style={{ background: "rgba(10,15,30,0.9)", border: "1px solid #1a2040", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3, marginBottom: 16 }}>PERFORMANCE BY DOMAIN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.values(byDomain).sort((a, b) => (a.correct / a.total) - (b.correct / b.total)).map(d => {
            const dpct = Math.round((d.correct / d.total) * 100);
            const dcolor = dpct >= 80 ? "#00C9A7" : dpct >= 60 ? "#F7C948" : "#ef4444";
            return (
              <div key={d.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "#9ca3af", fontSize: 13 }}>{d.emoji} {d.name}</span>
                  <span style={{ color: dcolor, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>{d.correct}/{d.total} — {dpct}%</span>
                </div>
                <div style={{ height: 6, background: "#0a0f1e", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${dpct}%`, background: dcolor, borderRadius: 99, transition: "width 1s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wrong questions review */}
      {wrong.length > 0 && (
        <div style={{ background: "rgba(10,15,30,0.9)", border: "1px solid #1a2040", borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showWrong ? 16 : 0 }}>
            <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3 }}>📋 REVIEW WRONG ({wrong.length})</div>
            <button onClick={() => setShowWrong(v => !v)} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "4px 12px", cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
              {showWrong ? "HIDE ▲" : "SHOW ▼"}
            </button>
          </div>
          {showWrong && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {wrong.map((r, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${r.q.cityColor}`, paddingLeft: 14 }}>
                  <div style={{ color: r.q.cityColor, fontSize: 10, fontFamily: "monospace", marginBottom: 4 }}>{r.q.cityEmoji} {r.q.cityName.toUpperCase()}</div>
                  <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{r.q.text}</div>
          <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 4 }}>✗ Sua resposta: {Array.isArray(r.selected) ? r.selected.map(i => r.q.options[i]).join(" / ") : r.q.options[r.selected]}</div>
                  <div style={{ color: "#00C9A7", fontSize: 12, marginBottom: 6 }}>✓ Correto: {(() => { const c = r.q.correct; const arr = Array.isArray(c) ? c : (typeof c === "string" && c.includes(",")) ? c.split(",").map(Number) : [Number(c)]; return arr.map(i => r.q.options[i]).join(" / "); })()}</div>
                  <div style={{ color: "#4b5563", fontSize: 12, lineHeight: 1.6, background: "rgba(0,201,167,0.04)", borderRadius: 8, padding: "8px 12px" }}>{r.q.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onRetry} style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg, #00C9A7, #00C9A799)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🔄 New Session</button>
        <button onClick={onBack} style={{ flex: 1, padding: "14px", background: "rgba(247,201,72,0.1)", border: "1px solid #F7C94844", borderRadius: 14, color: "#F7C948", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🗺️ World Map</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("mode");
  const [hero, setHero] = useState(null);
  const [heroFor, setHeroFor] = useState("adventure");
  const [cities, setCities] = useState(CITIES);
  const [activeCity, setActiveCity] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState(null);
  const [trainingQuestions, setTrainingQuestions] = useState([]);
  const [trainingResults, setTrainingResults] = useState([]);
  const [trainingXP, setTrainingXP] = useState(0);
  const [externalQuestions, setExternalQuestions] = useState(null); // null = ainda não tentou

  // Carrega questões externas do GitHub na primeira vez que abre o Training
  const loadExternal = () => {
    if (externalQuestions !== null) return; // já carregou ou tentou
    setExternalQuestions([]); // marca como "tentando"
    fetch("https://raw.githubusercontent.com/saur-w/gcp-chronicles/main/src/questions.json")
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setExternalQuestions(data) : setExternalQuestions([]))
      .catch(() => setExternalQuestions([]));
  };

  const level = Math.floor(xp / 500) + 1;
  const showToast = (msg, color = "#00C9A7") => { setToast({ msg, color }); setTimeout(() => setToast(null), 3500); };

  const handleBossComplete = (score, total) => {
    const gained = score * XP_CORRECT + (total - score) * XP_WRONG;
    setXp(x => x + gained);
    if (score / total >= 0.6 && !completedChallenges.has(activeCity.id)) {
      setCompletedChallenges(prev => new Set([...prev, activeCity.id]));
      const idx = cities.findIndex(c => c.id === activeCity.id);
      if (idx < cities.length - 1) { setCities(prev => prev.map((c, i) => i === idx + 1 ? { ...c, locked: false } : c)); showToast(`🌟 ${cities[idx + 1].name} UNLOCKED!`, "#F7C948"); }
      else showToast("🏆 ALL CITIES CONQUERED! You are a Data Architect!", "#F7C948");
    }
    setScreen("city");
  };

  const handleTrainingComplete = (results) => {
    const correct = results.filter(r => r.correct).length;
    const wrong = results.length - correct;
    const gained = correct * XP_CORRECT + wrong * XP_WRONG;
    setXp(x => x + gained);
    setTrainingXP(gained);
    setTrainingResults(results);
    setScreen("training-report");
    showToast(`+${gained} XP earned! 🎯`, "#00C9A7");
  };

  const HEADER = (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ fontSize: 10, letterSpacing: 8, color: "#1a2040", textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace" }}>✦ GCP PROFESSIONAL DATA ENGINEER ✦</div>
      <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(18px,3.5vw,36px)", fontWeight: 900, color: "#e5e7eb", letterSpacing: 2, marginBottom: 4, lineHeight: 1.3 }}>
        THE SCORPIO<br /><span style={{ background: "linear-gradient(135deg, #F7C948 0%, #f97316 60%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SKY CHRONICLES</span>
      </h1>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Raleway:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #04080f; }
        @keyframes twkl { from { opacity: 0.05; } to { opacity: 0.8; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shakeEl { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1a2040; border-radius: 2px; }
        button { font-family: 'Raleway', sans-serif; } input { font-family: 'Raleway', sans-serif; }
      `}</style>
      <Stars />
      {toast && (<div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#04080f", border: `1px solid ${toast.color}`, borderRadius: 12, padding: "12px 24px", color: toast.color, fontWeight: 700, fontSize: 13, zIndex: 9999, animation: "toastIn 0.4s ease", boxShadow: `0 0 30px ${toast.color}33`, fontFamily: "monospace", whiteSpace: "nowrap" }}>{toast.msg}</div>)}
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #070d1f 0%, #04080f 60%)", fontFamily: "'Raleway', sans-serif", color: "#e5e7eb", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
          {HEADER}

          {/* ── MODE SELECT ── */}
          {screen === "mode" && (
            <ModeSelect
              onAdventure={() => { setHeroFor("adventure"); setScreen(hero ? "map" : "char"); }}
              onTraining={() => { setHeroFor("training"); loadExternal(); setScreen(hero ? "training-setup" : "char"); }}
            />
          )}

          {/* ── CHARACTER SELECT (shared) ── */}
          {screen === "char" && (
            <CharacterSelect onSelect={c => {
              setHero(c);
              if (heroFor === "training") { setScreen("training-setup"); showToast(`${c.name} enters the training grounds!`, c.color); }
              else { setScreen("map"); showToast(`Welcome, ${c.name}! Your journey begins.`, c.color); }
            }} />
          )}

          {/* ── ADVENTURE SCREENS ── */}
          {screen === "map" && <WorldMap cities={cities} hero={hero} xp={xp} level={level} completedLessons={completedLessons} completedChallenges={completedChallenges} onCityClick={c => { setActiveCity(c); setScreen("city"); }} onChangeHero={() => setScreen("char")} onTrainingMode={() => { setHeroFor("training"); loadExternal(); setScreen("training-setup"); }} />}
          {screen === "city" && <CityView city={activeCity} hero={hero} completedLessons={completedLessons} completedChallenge={completedChallenges.has(activeCity?.id)} onLesson={l => { setActiveLesson(l); setScreen("lesson"); }} onChallenge={() => setScreen("boss")} onBack={() => setScreen("map")} />}
          {screen === "lesson" && <LessonView lesson={activeLesson} city={activeCity} hero={hero} onComplete={() => { if (!completedLessons.has(activeLesson.id)) { setCompletedLessons(prev => new Set([...prev, activeLesson.id])); setXp(x => x + XP_LESSON); showToast(`+${XP_LESSON} XP! Lesson complete! ✨`, activeCity.color); } setScreen("city"); }} onBack={() => setScreen("city")} />}
          {screen === "boss" && <BossFight city={activeCity} hero={hero} onComplete={handleBossComplete} onBack={() => setScreen("city")} />}

          {/* ── TRAINING SCREENS ── */}
          {screen === "training-setup" && (
            <TrainingSetup hero={hero} externalQuestions={externalQuestions || []} onStart={pool => { setTrainingQuestions(pool); setScreen("training-session"); }} onBack={() => setScreen(hero ? "map" : "mode")} onChangeHero={() => { setHeroFor("training"); setScreen("char"); }} onGoAdventure={() => setScreen(hero ? "map" : "char")} />
          )}
          {screen === "training-session" && (
            <TrainingSession questions={trainingQuestions} hero={hero} onComplete={handleTrainingComplete} onBack={() => setScreen("training-setup")} onGoAdventure={() => setScreen(hero ? "map" : "char")} />
          )}
          {screen === "training-report" && (
            <TrainingReport results={trainingResults} hero={hero} xpGained={trainingXP} onRetry={() => setScreen("training-setup")} onBack={() => setScreen("map")} />
          )}
        </div>
      </div>
    </>
  );
}
