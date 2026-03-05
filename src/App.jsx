import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════
// CHARACTERS
// ═══════════════════════════════════════════════════════════
const CHARACTERS = [
  { id: "kassandra", name: "Kassandra", origin: "Ancient Greece", emoji: "⚔️", color: "#c9a84c", accent: "#ffd700", desc: "Misthios de Esparta. Teme nada.", art: "🏛️" },
  { id: "aloy", name: "Aloy", origin: "The Frontier", emoji: "🏹", color: "#e8833a", accent: "#ff9f55", desc: "Caçadora de máquinas antigas.", art: "🌿" },
  { id: "eivor", name: "Eivor", origin: "Norway", emoji: "🪓", color: "#6b9fd4", accent: "#8fc0f0", desc: "Viking conquistadora de reinos.", art: "⚡" },
  { id: "zelda", name: "Zelda", origin: "Hyrule", emoji: "✨", color: "#9b72cf", accent: "#c4a7e7", desc: "Princesa. Sábia. Guardiã da sabedoria.", art: "🔮" },
  { id: "custom", name: "Custom", origin: "Your World", emoji: "🌟", color: "#4ade80", accent: "#86efac", desc: "Escreva sua própria lenda.", art: "🌟" },
];

// ═══════════════════════════════════════════════════════════
// WORLD DATA
// ═══════════════════════════════════════════════════════════
const CITIES = [
  {
    id: "bigquery", name: "Querythas", subtitle: "The Crystal Warehouse", emoji: "🏰",
    color: "#4A90E2", glow: "#4A90E230", domain: "BigQuery — Storage & Optimization",
    bossName: "The Cost Dragon", bossEmoji: "🐉", bossDesc: "Um dragão ancestral que devora ouro a cada query não otimizada.",
    locked: false,
    lessons: [
      { id: "bq-1", title: "Partitioning vs Clustering", icon: "📦", concept: "Como organizar dados para economizar ouro (dinheiro)", keyPoints: [{ label: "Partitioning", text: "Divide fisicamente a tabela em segmentos por data/hora. BigQuery pula partições inteiras — como fechar alas do castelo que não precisa." }, { label: "Clustering", text: "Ordena dados dentro das partições por até 4 colunas. Do menor para o maior cardinality (estado → cidade → store_id)." }, { label: "Use os dois!", text: "Particione por data + clustering por colunas de filtro = máxima economia e velocidade." }, { label: "⚠️ Regra", text: "BigQuery só permite UMA coluna de partição por tabela." }], analogy: "Partitioning = salas separadas por ano. Clustering = dentro de cada sala, pergaminhos ordenados por tópico. Você só entra na sala que precisa.", tip: "Sempre filtre na coluna de partição no WHERE, senão paga por um full table scan!" },
      { id: "bq-2", title: "Materialized Views vs BI Engine", icon: "⚡", concept: "Pré-computar respostas para economizar tempo e ouro", keyPoints: [{ label: "Materialized Views", text: "Pré-agregam dados fisicamente. Refresh incremental quando a fonte muda. Para queries de agregação repetidas em tabelas grandes (TBs)." }, { label: "BI Engine", text: "Cache em memória para tabelas de dimensão pequenas. Ótimo para dashboards com datasets pequenos. Não aguenta uma tabela de 50TB." }, { label: "Authorized Views", text: "Só controle de acesso — NÃO melhoram performance." }, { label: "Quando usar o quê", text: "Grande tabela + agregações repetidas → Materialized View. Tabela pequena + muitos usuários BI → BI Engine. Compartilhar dados com segurança → Analytics Hub." }], analogy: "O escriba do palácio pré-calcula os impostos toda noite para o rei não esperar 10 minutos toda manhã. Isso é uma Materialized View.", tip: "No exame: 'reduzir tempo de resposta, custos, manutenção mínima' para tabela grande agregada → Materialized Views é quase sempre a resposta." },
      { id: "bq-3", title: "Security & Sharing Data", icon: "🔐", concept: "Quem pode ver o quê, e como compartilhar sem duplicar", keyPoints: [{ label: "Analytics Hub", text: "Publique datasets uma vez. Outros times ASSINAM — sem duplicação. Cria authorized dataset automaticamente." }, { label: "CMEK", text: "Você controla a chave de criptografia no Cloud KMS." }, { label: "Cloud EKM", text: "Chave fica no SEU HSM on-premises, nunca exportada para o Google." }, { label: "Cloud DLP", text: "De-identifique PII antes de carregar. Use CryptoDeterministicConfig para tokenização determinística — preserva JOINs." }], analogy: "Analytics Hub é a biblioteca real: livros publicados uma vez, qualquer guilda pode assinar. Sem precisar imprimir o livro inteiro para cada guilda!", tip: "Armadilha: bigquery.jobUser permite EXECUTAR jobs, mas NÃO concede acesso aos dados. Para acesso, precisa bigquery.dataViewer ou superior." },
    ],
    questions: [
      { text: "Você precisa fazer query numa tabela de 10TB filtrando pelos últimos 30 dias, agrupada por estado, cidade e loja. Como estruturar a tabela?", analogy: "🐉 O Dragão observa cada byte que você escaneia!", options: ["Partition por transaction_time; cluster por estado → cidade → store_id", "Partition por transaction_time; cluster por store_id → cidade → estado", "Cluster apenas por estado → cidade → store_id (sem partition)", "Cluster apenas por store_id → cidade → estado (sem partition)"], correct: 0, explanation: "Partition por tempo (elimina dados antigos do scan) + cluster do menor para maior cardinality (estado→cidade→store_id) corresponde aos padrões de filtro mais comuns." },
      { text: "Sua ferramenta BI roda centenas de queries diárias agregando uma tabela de 50TB. Queries lentas e caras. Minimize tempo de resposta, custo e manutenção.", analogy: "🐉 O dragão cobra ouro por byte escaneado. Pré-cozinhe suas respostas!", options: ["Construa materialized views com agregações por dia e mês", "Construa authorized views com agregações por dia e mês", "Ative BI Engine e adicione a tabela como preferida", "Crie uma scheduled query para construir tabelas de agregação de hora em hora"], correct: 0, explanation: "Materialized views pré-agregam fisicamente. BI Engine cacheia tabelas de dimensão pequenas (não aguenta 50TB). Authorized views são para controle de acesso. Scheduled queries têm lag e custo." },
      { text: "Vários times precisam de acesso a dados centralizados de clientes no BigQuery. Você quer minimizar duplicação e overhead operacional.", options: ["Peça a cada time para criar authorized views. Conceda bigquery.jobUser.", "Publique dados no BigQuery Analytics Hub. Direcione os times para assinar.", "Crie scheduled query para replicar dados em cada projeto.", "Permita que cada time crie materialized views dos dados que precisam."], correct: 1, explanation: "Analytics Hub cria authorized dataset automaticamente na assinatura — zero duplicação! bigquery.jobUser não concede acesso aos dados. Replicar aumenta custo e manutenção." },
      { text: "Uma chave Cloud KMS protegendo dados no Cloud Storage foi comprometida. Re-encripte todos os dados, delete a chave antiga. O que fazer?", options: ["Rotacione a versão da chave Cloud KMS. Continue usando o mesmo bucket.", "Crie nova chave KMS. Configure como CMEK padrão no bucket existente.", "Crie nova chave KMS. Novo bucket. Copie objetos especificando a nova chave.", "Crie nova chave KMS. Novo bucket com CMEK padrão. Copie objetos SEM especificar chave."], correct: 3, explanation: "Novo bucket com CMEK padrão garante que TODOS os objetos escritos (incluindo cópias) sejam protegidos automaticamente. Rotacionar não re-encripta dados existentes." },
    ],
  },
  {
    id: "dataflow", name: "Streamhaven", subtitle: "The River City", emoji: "🌊",
    color: "#00C9A7", glow: "#00C9A730", domain: "Dataflow — Processing & Streaming",
    bossName: "The Watermark Hydra", bossEmoji: "🐍", bossDesc: "Corte uma cabeça de delay e duas mais aparecem.",
    locked: true,
    lessons: [
      { id: "df-1", title: "Streaming vs Batch", icon: "🌊", concept: "Quando processar em tempo real vs em lotes", keyPoints: [{ label: "Batch (Dataflow)", text: "Processa datasets limitados em um schedule. Bom para ETL, análise histórica. Maior latência, menor custo." }, { label: "Streaming (Dataflow)", text: "Processa streams contínuos. Use para analytics em tempo real, detecção de fraude, IoT." }, { label: "Pub/Sub + Dataflow", text: "A combinação de ouro: Pub/Sub bufferiza; Dataflow processa com windowing, watermarks e estado." }, { label: "Dataproc vs Dataflow", text: "Dataproc = Spark/Hadoop gerenciado (seu código). Dataflow = serverless, autoscaling, Apache Beam gerenciado." }], analogy: "Batch é colher grãos uma vez por ano. Streaming é um moinho d'água 24/7. Dataflow é o moinho — você define como moer, ele gerencia o nível da água (autoscaling).", tip: "Exame: 'serverless', 'autoscaling', 'streaming com janelas' → Dataflow. 'Jobs Spark/Hadoop existentes', 'Hive' → Dataproc." },
      { id: "df-2", title: "Windows, Watermarks & Late Data", icon: "⏱️", concept: "Agrupando eventos de streaming por tempo", keyPoints: [{ label: "Tumbling Windows (Fixed)", text: "Janelas não sobrepostas. Ex: agregações horárias." }, { label: "Sliding Windows", text: "Janelas sobrepostas. Ex: 'últimos 30 min, calculado a cada 5 min'." }, { label: "Watermarks", text: "Timestamp estimando 'o quão atrasado' está o pipeline. Dispara quando fechar uma janela." }, { label: "AllowedLateness", text: "Quanto tempo esperar eventos tardios após o watermark." }], analogy: "Coletando chuva em baldes por hora (tumbling window). O watermark é seu assistente dizendo 'acho que toda chuva das 15h já está no balde'. AllowedLateness = 'espera mais 5 min por via das dúvidas'.", tip: "Para 'agregar eventos em intervalos horários do Pub/Sub' → sempre Dataflow streaming com tumbling windows." },
      { id: "df-3", title: "Operações e Otimização", icon: "🔧", concept: "Executar, atualizar e debugar pipelines", keyPoints: [{ label: "Job Update (Zero Downtime)", text: "Dataflow suporta atualizações in-place. Substitui o pipeline em execução com nova versão, estado preservado." }, { label: "Reshuffle", text: "Insira após steps mesclados para forçar o Dataflow a separá-los — permite métricas individuais para identificar gargalos." }, { label: "Streaming Engine", text: "Move estado das janelas para fora das VMs workers para um backend gerenciado. Reduz necessidade de memória." }, { label: "Autoscaling", text: "Dataflow ajusta automaticamente a contagem de workers." }], analogy: "Job Update é como uma tripulação de navio trocando velas no meio do oceano sem parar. Reshuffle é forçar checkpoints separados em uma linha de montagem para ver qual estação está lenta.", tip: "Identificar gargalo: use Reshuffle para separar steps mesclados, depois monitore métricas por step no console Dataflow." },
    ],
    questions: [
      { text: "Um pipeline streaming do Dataflow está processando lentamente. O grafo foi automaticamente mesclado em um step. Como identificar o gargalo?", analogy: "🐍 A Hydra se esconde dentro de steps fundidos — você precisa revelar suas cabeças!", options: ["Verifique Cloud Logging para mensagens de erro nos workers", "Insira Reshuffle após cada step de processamento; monitore detalhes no console Dataflow", "Aumente o número de workers Dataflow", "Reinicie o job com mais memória"], correct: 1, explanation: "Reshuffle previne fusão de steps, fazendo o Dataflow mostrar métricas individuais. O console então revela qual step tem backlog." },
      { text: "Você precisa processar eventos do Pub/Sub e agregar em intervalos horários antes de carregar no BigQuery. Alto volume, deve escalar. Qual tecnologia?", options: ["Cloud Function disparada por Pub/Sub por mensagem", "Cloud Function agendada de hora em hora para puxar mensagens Pub/Sub", "Dataflow batch job agendado de hora em hora", "Dataflow streaming job com tumbling windows de 1 hora"], correct: 3, explanation: "Dataflow streaming com FixedWindows(1h) é a única solução que: auto-escala, lida com dados tardios, processa continuamente e escreve resultados agregados direto no BigQuery." },
      { text: "Nova versão do pipeline (lendo Pub/Sub → escrevendo BigQuery). Versão atual em produção. Deploy com zero downtime.", options: ["Pare o job antigo, espere o backlog drenar, inicie novo job", "Use Dataflow job update para substituir o job em execução", "Execute novo job em paralelo, pare o antigo quando estabilizar", "Use Cloud Composer para orquestrar a troca"], correct: 1, explanation: "Dataflow job update substitui o job em execução in-place, preservando estado dos workers e não interrompendo processamento do Pub/Sub." },
    ],
  },
  {
    id: "storage", name: "The Vault", subtitle: "City of Storage Secrets", emoji: "🗝️",
    color: "#E05C5C", glow: "#E05C5C30", domain: "Storage & Security — IAM, Bigtable, Spanner",
    bossName: "The Permission Thief", bossEmoji: "🦹", bossDesc: "Rouba acessos quando você menos espera. Sobre-permissões são sua arma.",
    locked: true,
    lessons: [
      { id: "st-1", title: "Escolhendo o Storage Certo", icon: "🗄️", concept: "Qual serviço GCP de storage para qual caso de uso", keyPoints: [{ label: "BigQuery", text: "Data warehouse analítico. Escala petabytes. SQL. Alta latência por linha única. NÃO para serving <100ms." }, { label: "Bigtable", text: "NoSQL wide-column. Latência milissegundos. Para time-series, IoT, serving de predições ML. Design do row key é CRÍTICO." }, { label: "Cloud SQL", text: "Relacional gerenciado (MySQL/PostgreSQL). Para OLTP transacional. Escala limitada vs Spanner." }, { label: "Cloud Spanner", text: "Relacional distribuído globalmente. Transações ACID em escala. Para OLTP global. Mais caro que Cloud SQL." }], analogy: "BigQuery = arquivo real (ótimo para pesquisa, lento para buscar um pergaminho). Bigtable = serviço de entrega expressa (instantâneo, organizado por destinatário). Spanner = tesouro do império (global, sempre consistente, caro).", tip: "Padrão do exame: 'servir predições ML com latência <100ms' → Bigtable (NÃO BigQuery). 'Transações ACID globais' → Spanner." },
      { id: "st-2", title: "Bigtable Row Key Design", icon: "🔑", concept: "O conceito mais importante no Bigtable", keyPoints: [{ label: "Hotspotting", text: "Se row keys são monotonicamente crescentes (como timestamps), todas as escritas vão para UM servidor tablet → gargalo." }, { label: "Fix: Reverse timestamps", text: "Use timestamps invertidos para que dados recentes não se aglomerem no mesmo extremo." }, { label: "Regra: Prefixo de alta cardinalidade", text: "Comece keys com a entidade que você mais consulta (símbolo de ação, user_id). Depois timestamp. Ex: AAPL#1234567890" }, { label: "Salt/Hash", text: "Para chaves 'quentes', adicione prefixo aleatório (salting) para distribuir escritas entre tablets." }], analogy: "Se você organiza uma biblioteca por 'data de adição' — todos os livros DE HOJE se empilham na mesa de um bibliotecário. Caos! Em vez disso, ordene por AUTOR primeiro, depois data.", tip: "Armadilha clássica: 'datetime como início do row key causa degradação de performance com milhares de usuários' → SEMPRE mude para começar com o identificador da entidade." },
      { id: "st-3", title: "IAM & Encryption", icon: "🛡️", concept: "Protegendo dados no GCP", keyPoints: [{ label: "Princípio do Menor Privilégio", text: "Conceda permissões mínimas necessárias. dataViewer (só leitura) vs dataEditor vs admin." }, { label: "CMEK vs CSEK vs EKM", text: "CMEK = chave no Cloud KMS. CSEK = você fornece a chave por requisição. EKM = chave fica no SEU HSM externo, nunca sai." }, { label: "Cloud DLP", text: "Detecte e de-identifique PII. Use CryptoDeterministicConfig para tokenização que preserva capacidade de JOIN." }, { label: "VPC Service Controls", text: "Perímetro de segurança ao redor de projetos. Previne exfiltração de dados para serviços suportados." }], analogy: "EKM é como um hotel que te deixa usar seu próprio cadeado — o hotel pode abrir a forma da fechadura, mas a chave real nunca sai do seu chaveiro. O material da chave NUNCA vai para o Google.", tip: "Para PII em múltiplos datasets que precisam de JOIN: CryptoDeterministicConfig (format-preserving, determinístico)." },
    ],
    questions: [
      { text: "Você tem um modelo BigQuery ML. Uma aplicação precisa servir predições por user_id com latência <100ms. Qual arquitetura?", analogy: "🦹 O ladrão é lento — e a latência do BigQuery vai roubar seu SLA!", options: ["Adicione filtro WHERE user_id=? na query BigQuery ML. Conceda BigQuery Data Viewer.", "Crie authorized view. Compartilhe o dataset com a service account.", "Pipeline Dataflow lê resultados BigQuery ML. Conceda Dataflow Worker role.", "Dataflow lê predições do BigQuery ML → escreve no Bigtable (user_id como row key) → app lê do Bigtable."], correct: 3, explanation: "Latência do BigQuery regularmente excede 100ms para lookups de linha única. Pré-compute predições com Dataflow, armazene no Bigtable (user_id como row key = lookups O(1) <10ms), app lê do Bigtable." },
      { text: "Armazene dados de trade de ações no Bigtable. Datetime é o início do row key. Milhares de usuários simultâneos. Performance degrada conforme mais dados são adicionados. Corrija.", options: ["Mude row key para começar com o símbolo da ação", "Mude row key para começar com número aleatório por segundo", "Migre dados para BigQuery", "Adicione mais nós Bigtable"], correct: 0, explanation: "Datetime como chave causa hotspotting: todas as escritas recentes vão para um servidor tablet. Começar com símbolo da ação distribui escritas pelos símbolos (prefixo de alta cardinalidade)." },
    ],
  },
  {
    id: "composer", name: "Pipeforge", subtitle: "The Automation Citadel", emoji: "⚙️",
    color: "#A259FF", glow: "#A259FF30", domain: "Cloud Composer, Dataproc & Automação",
    bossName: "The Broken Pipeline Golem", bossEmoji: "🤖", bossDesc: "Construído de DAGs falhos e jobs não monitorados. Nunca para.",
    locked: true,
    lessons: [
      { id: "cp-1", title: "Cloud Composer & Airflow DAGs", icon: "🎼", concept: "Orquestrando pipelines de dados complexos", keyPoints: [{ label: "DAG (Directed Acyclic Graph)", text: "Uma definição de workflow no Airflow/Composer. Define tasks e dependências. Sem ciclos permitidos." }, { label: "BigQueryInsertJobOperator", text: "O operador correto para executar queries SQL no BigQuery a partir do Composer. Suporta retry e email_on_failure." }, { label: "BigQueryUpsertTableOperator", text: "Para criar/atualizar PROPRIEDADES de tabelas (schema, metadata). NÃO para executar queries." }, { label: "Parâmetros chave", text: "retry=3 (tenta 3 vezes), email_on_failure=True (envia email se todas as tentativas falharem)." }], analogy: "Um DAG é como uma receita culinária para o banquete do reino: primeiro reúna ingredientes (task 1), depois prepare (task 2), depois cozinhe (task 3). Se um passo falhar, tente até 3 vezes.", tip: "Armadilha: BigQuery Scheduled Queries não têm opções de retry. Para retry + email_on_failure → deve usar Cloud Composer com BigQueryInsertJobOperator." },
      { id: "cp-2", title: "Dataproc — Spark & Hadoop Gerenciados", icon: "⚡", concept: "Quando usar Dataproc vs outras opções", keyPoints: [{ label: "Pontos fortes do Dataproc", text: "Spark/Hadoop gerenciado. Lift-and-shift de jobs existentes. Spin-up mais rápido que on-prem. Integra com conector GCS." }, { label: "Ephemeral vs Persistent clusters", text: "Ephemeral: suba para um job, depois encerre (econômico). Persistent: para jobs interativos frequentes e curtos." }, { label: "Jobs intensivos em I/O", text: "Para jobs Hadoop intensivos em disco no Dataproc: armazene dados intermediários no HDFS NATIVO (Persistent Disk), não Cloud Storage. GCS adiciona latência de rede." }, { label: "Quando NÃO Dataproc", text: "Para pipelines serverless → Dataflow. Para transformações SQL → BigQuery. Para jobs agendados simples → Cloud Composer + BigQuery." }], analogy: "Dataproc é como alugar uma equipe de forjadores que sabe trabalhar com SUAS ferramentas existentes. O conector Cloud Storage é ótimo para o armazém final, mas para metalurgia intermediária quente — mantenha na forja local (HDFS nativo) para velocidade.", tip: "Job Hadoop intensivo em I/O mais lento no Dataproc que on-prem? → Aloque mais Persistent Disk, armazene dados intermediários no HDFS local. Latência de rede para GCS é o culpado." },
      { id: "cp-3", title: "Governança & Migração de Dados", icon: "🗺️", concept: "Gerenciando dados em escala e movendo para GCP", keyPoints: [{ label: "Dataplex", text: "Camada unificada de governança. Gerencia dados ONDE ESTÃO (sem migração). Auto-descoberta, linhagem de dados, validação de qualidade." }, { label: "Transfer Appliance", text: "Dispositivo físico para transferir 1 PB+ para GCP em horas/dias." }, { label: "Database Migration Service", text: "Para migrar bancos de dados (MySQL, PostgreSQL, SQL Server, Oracle) para Cloud SQL ou AlloyDB." }, { label: "Datastream", text: "CDC serverless para replicação contínua. Não migração única — sync contínuo de Oracle/MySQL/PostgreSQL." }], analogy: "Dataplex é um cartógrafo real que mapeia todos os tesouros do reino (dados) sem movê-los — apenas cria um catálogo mestre. Transfer Appliance é enviar um baú de ouro por carruagem blindada em vez de enviar moedas uma a uma (internet).", tip: "Migração de 1 PB em 'algumas horas' → Transfer Appliance. Replicação CDC contínua com infra mínima → Datastream. Descoberta + linhagem + qualidade em um lugar → Dataplex." },
    ],
    questions: [
      { text: "Você precisa executar uma transformação SQL no BigQuery com até 3 retentativas e notificação por email se todas falharem. Qual solução?", analogy: "🤖 O Golem quebra cada pipeline. Você precisa de um engenheiro que tente 3 vezes antes de pedir ajuda!", options: ["BigQuery scheduled query com notificação Pub/Sub após falha", "BigQueryUpsertTableOperator no Cloud Composer, retry=3, email_on_failure=True", "BigQuery scheduled query + Cloud Run function para enviar email após 3 falhas", "BigQueryInsertJobOperator no Cloud Composer, retry=3, email_on_failure=True"], correct: 3, explanation: "BigQueryInsertJobOperator executa transformações SQL no BigQuery. Com retry=3 e email_on_failure=True, tenta 3 vezes e depois envia email. BigQuery scheduled queries não têm opções de retry. BigQueryUpsertTableOperator é para schema/propriedades de tabela." },
      { text: "Você precisa migrar 1 PB de dados de um datacenter on-premises para Google Cloud. A migração deve completar em algumas horas com conexão segura. Melhor prática?", options: ["gsutil com upload paralelo pela internet", "Cloud VPN + Storage Transfer Service", "Transfer Appliance", "Dedicated Interconnect + gsutil"], correct: 2, explanation: "Transfer Appliance é um dispositivo físico para transferência em larga escala (centenas de TB a PB) em horas. Fazer upload de 1 PB pela internet levaria semanas mesmo com Dedicated Interconnect." },
    ],
  },
  {
    id: "vertex", name: "Neuralspire", subtitle: "The AI Citadel", emoji: "🧠",
    color: "#EC4899", glow: "#EC489930", domain: "Vertex AI & Machine Learning",
    bossName: "The Overfit Oracle", bossEmoji: "🔮", bossDesc: "Um oráculo que memoriza tudo mas não generaliza nada.",
    locked: true,
    lessons: [
      { id: "vx-1", title: "Overfitting & Regularização", icon: "📊", concept: "Quando seu modelo memoriza em vez de aprender", keyPoints: [{ label: "Overfitting", text: "O modelo aprende os dados de treino tão bem que falha em dados novos. Alta acurácia no treino, baixa no teste." }, { label: "Soluções", text: "Mais dados de treino, menos features, aumentar regularização (L1/L2), usar dropout em redes neurais." }, { label: "L1 vs L2", text: "L1 (Lasso) = esparsidade, zera features irrelevantes. L2 (Ridge) = penaliza pesos grandes, mais suave." }, { label: "Dropout", text: "Desativa aleatoriamente neurônios durante treino, forçando o modelo a aprender representações mais robustas." }], analogy: "Overfitting é como estudar para a prova memorizando todas as respostas do gabarito antigo. Você passa naquele teste específico, mas falha em qualquer variação das questões.", tip: "Exame: 'modelo com boa acurácia no treino mas ruim no teste' → overfitting. Soluções: mais dados, menos features, mais regularização, dropout." },
      { id: "vx-2", title: "Feature Engineering", icon: "⚙️", concept: "Transformando dados brutos em features úteis", keyPoints: [{ label: "Feature Crosses", text: "Combine duas ou mais features para criar interações. Ex: latitude × longitude para localização geográfica." }, { label: "Bucketização", text: "Converta features contínuas em categorias discretas para capturar relações não-lineares." }, { label: "Embedding", text: "Represente categorias de alta cardinalidade como vetores densos de dimensão menor." }, { label: "Normalização", text: "Escale features para o mesmo range (0-1 ou z-score) para evitar que features grandes dominem." }], analogy: "Feature engineering é como preparar ingredientes antes de cozinhar. Você pode ter os melhores ingredientes (dados brutos), mas precisa cortá-los, temperá-los e prepará-los corretamente para que o prato (modelo) fique bom.", tip: "Para dados com fronteiras circulares/radiais em 2D (X,Y) com classificação por círculos: feature sintética X²+Y² captura a separação radial que um algoritmo linear não consegue." },
    ],
    questions: [
      { text: "Você está treinando um classificador de spam. Você nota que está overfitting nos dados de treino. Quais três ações podem resolver o problema? (Escolha três)", options: ["Obtenha mais exemplos de treino", "Reduza o número de exemplos de treino", "Use um conjunto menor de features", "Use um conjunto maior de features", "Aumente os parâmetros de regularização", "Diminua os parâmetros de regularização"], correct: 0, explanation: "Para resolver overfitting: (A) Mais dados de treino ajudam o modelo a generalizar. (C) Menos features reduz complexidade. (E) Mais regularização penaliza pesos grandes. Reduzir dados ou features aumenta overfitting. Diminuir regularização também piora." },
      { text: "Você tem dados em 2D (X,Y) onde a cor de cada ponto representa sua classe. Os dados formam padrões circulares. Você quer classificar usando um algoritmo linear. Qual feature sintética adicionar?", options: ["X²+Y²", "X²", "Y²", "cos(X)"], correct: 0, explanation: "X²+Y² representa a distância ao quadrado da origem. Para dados separados radialmente (círculos concêntricos), isso cria uma nova dimensão onde os dados se tornam linearmente separáveis." },
    ],
  },
];

const XP_LESSON = 50;
const XP_CORRECT = 100;
const XP_WRONG = 15;

// ═══════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════
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
        <div style={{ height: "100%", width: `${(cur / needed) * 100}%`, background: "linear-gradient(90deg, #F7C948, #f97316)", borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ color: "#374151", fontSize: 10, fontFamily: "monospace" }}>{xp}xp</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHARACTER SELECT — mostra as duas opções direto
// ═══════════════════════════════════════════════════════════
function CharacterSelect({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [customName, setCustomName] = useState("");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null); // "adventure" | "arena"

  const handlePick = () => {
    if (!selected || !mode) return;
    const char = CHARACTERS.find(c => c.id === selected);
    if (char.id === "custom" && !customName.trim()) return;
    const name = char.id === "custom" ? customName.trim() : char.name;
    onSelect({ ...char, name }, mode);
  };

  return (
    <div style={{ animation: "fadeUp 0.6s ease", maxWidth: 860, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#374151", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>✦ QUEM CAMINHA PELO CÉU DE ESCORPIÃO? ✦</div>
        <h2 style={{ fontSize: "clamp(20px,4vw,32px)", fontWeight: 800, color: "#e5e7eb", letterSpacing: 2, marginBottom: 8 }}>ESCOLHA SEU HERÓI</h2>
        <p style={{ color: "#4b5563", fontSize: 13, maxWidth: 480, margin: "0 auto" }}>
          Cinco cidades flutuam no céu. Apenas um verdadeiro Arquiteto de Dados pode desvendar seus segredos.
        </p>
      </div>

      {/* Personagens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14, marginBottom: 28 }}>
        {CHARACTERS.map(c => {
          const active = hovered === c.id || selected === c.id;
          return (
            <div key={c.id} onClick={() => setSelected(c.id)}
              onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              style={{ borderRadius: 18, padding: "20px 14px", textAlign: "center", cursor: "pointer", background: active ? "rgba(17,24,39,0.98)" : "rgba(17,24,39,0.7)", border: `2px solid ${active ? c.color : c.color + "33"}`, transition: "all 0.3s", transform: active ? "translateY(-6px)" : "none", boxShadow: active ? `0 16px 50px ${c.color}25` : "none" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{c.art}</div>
              <div style={{ color: active ? c.accent || c.color : c.color, fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{c.name}</div>
              <div style={{ color: "#4b5563", fontSize: 10, marginBottom: 6, fontFamily: "monospace" }}>{c.origin}</div>
              <div style={{ color: "#374151", fontSize: 11, lineHeight: 1.5 }}>{c.desc}</div>
              {c.id === "custom" && selected === "custom" && (
                <input value={customName} onChange={e => setCustomName(e.target.value)} onClick={e => e.stopPropagation()} placeholder="Seu nome..." style={{ marginTop: 10, width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid ${c.color}44`, borderRadius: 8, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, outline: "none" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Modo */}
      {selected && (
        <div style={{ animation: "fadeUp 0.4s", marginBottom: 24 }}>
          <div style={{ textAlign: "center", color: "#374151", fontSize: 11, letterSpacing: 4, fontFamily: "monospace", marginBottom: 16 }}>✦ ESCOLHA SEU CAMINHO ✦</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { id: "adventure", label: "🗺️ AVENTURA", desc: "Explore cidades, estude lições e enfrente bosses temáticos", color: "#F7C948" },
              { id: "arena", label: "⚔️ ARENA", desc: "Questões reais do exame GCP com filtro por domínio", color: "#00C9A7" },
            ].map(m => (
              <div key={m.id} onClick={() => setMode(m.id)}
                style={{ borderRadius: 16, padding: "20px", cursor: "pointer", background: mode === m.id ? `${m.color}12` : "rgba(17,24,39,0.8)", border: `2px solid ${mode === m.id ? m.color : m.color + "30"}`, transition: "all 0.3s", transform: mode === m.id ? "scale(1.02)" : "none", textAlign: "center" }}>
                <div style={{ color: m.color, fontWeight: 800, fontSize: 16, marginBottom: 8, letterSpacing: 1 }}>{m.label}</div>
                <div style={{ color: "#4b5563", fontSize: 12, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && mode && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.3s" }}>
          <button onClick={handlePick} style={{ padding: "16px 48px", background: `linear-gradient(135deg, #F7C948, #f97316)`, border: "none", borderRadius: 16, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: 2, boxShadow: "0 0 40px rgba(247,201,72,0.3)" }}>
            COMEÇAR JORNADA ⚔️
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ARENA — questões do JSON
// ═══════════════════════════════════════════════════════════
function Arena({ hero, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("menu"); // menu | battle
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [battleQuestions, setBattleQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    fetch("/gcp-chronicles/questions_all.json")
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => setError("Erro ao carregar questões. Verifique se o arquivo está em public/"));
  }, []);

  const domains = questions.length > 0
    ? ["all", ...new Set(questions.map(q => q.domain))]
    : ["all"];

  const domainLabels = { all: "🌐 Todos", bigquery: "🏰 BigQuery", dataflow: "🌊 Dataflow", storage: "🗝️ Storage", vertex: "🧠 Vertex AI", composer: "⚙️ Composer", pubsub: "📡 Pub/Sub", security: "🔐 Security", migration: "🚚 Migração", governance: "📋 Governança" };

  const startBattle = () => {
    const filtered = selectedDomain === "all" ? questions : questions.filter(q => q.domain === selectedDomain);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, filtered.length));
    setBattleQuestions(shuffled);
    setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false);
    setMode("battle");
  };

  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === battleQuestions[idx].correct) setScore(s => s + 1);
    else { setShake(true); setTimeout(() => setShake(false), 600); }
  };

  const next = () => {
    if (idx + 1 >= battleQuestions.length) setDone(true);
    else { setIdx(i => i + 1); setSelected(null); setAnswered(false); }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 16, animation: "twkl 1s infinite alternate" }}>⚔️</div>
      <div style={{ color: "#4b5563", fontFamily: "monospace" }}>Carregando questões...</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: 60, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
      <div style={{ color: "#ef4444", marginBottom: 16 }}>{error}</div>
      <button onClick={onBack} style={{ padding: "10px 24px", background: "none", border: "1px solid #374151", borderRadius: 8, color: "#9ca3af", cursor: "pointer" }}>← Voltar</button>
    </div>
  );

  if (mode === "menu") {
    const filtered = selectedDomain === "all" ? questions : questions.filter(q => q.domain === selectedDomain);
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.5s" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 24, fontFamily: "monospace" }}>← VOLTAR</button>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>⚔️</div>
          <h2 style={{ color: "#F7C948", fontWeight: 800, fontSize: 26, letterSpacing: 2, marginBottom: 6 }}>ARENA DE TREINAMENTO</h2>
          <div style={{ color: "#4b5563", fontSize: 13 }}>{questions.length} questões oficiais GCP disponíveis</div>
        </div>

        {/* Filtro por domínio */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#374151", fontSize: 11, letterSpacing: 3, fontFamily: "monospace", marginBottom: 12 }}>DOMÍNIO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {domains.map(d => (
              <button key={d} onClick={() => setSelectedDomain(d)}
                style={{ padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${selectedDomain === d ? "#F7C948" : "#1a2040"}`, background: selectedDomain === d ? "rgba(247,201,72,0.1)" : "rgba(10,15,30,0.8)", color: selectedDomain === d ? "#F7C948" : "#4b5563", fontSize: 12, cursor: "pointer", transition: "all 0.2s", fontFamily: "monospace" }}>
                {domainLabels[d] || d}
              </button>
            ))}
          </div>
          <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", marginTop: 8 }}>{filtered.length} questões no domínio selecionado</div>
        </div>

        {/* Quantidade */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#374151", fontSize: 11, letterSpacing: 3, fontFamily: "monospace", marginBottom: 12 }}>QUANTIDADE DE QUESTÕES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
            {[10, 20, 30, filtered.length].filter((v, i, a) => a.indexOf(v) === i && v > 0).map(count => (
              <button key={count} onClick={() => setQuestionCount(count)}
                style={{ padding: "16px 12px", background: questionCount === count ? "rgba(247,201,72,0.1)" : "rgba(10,15,30,0.9)", border: `2px solid ${questionCount === count ? "#F7C948" : "#1a2040"}`, borderRadius: 12, cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
                <div style={{ color: questionCount === count ? "#F7C948" : "#e5e7eb", fontWeight: 800, fontSize: 22, fontFamily: "monospace" }}>{count}</div>
                <div style={{ color: "#4b5563", fontSize: 10, marginTop: 2 }}>questões</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={startBattle} style={{ width: "100%", padding: "18px", background: "linear-gradient(135deg, #F7C948, #f97316)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: 1, boxShadow: "0 8px 30px rgba(247,201,72,0.3)" }}>
          ⚔️ INICIAR BATALHA
        </button>
      </div>
    );
  }

  if (mode === "battle") {
    if (done) {
      const pct = Math.round((score / battleQuestions.length) * 100);
      return (
        <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 560, margin: "0 auto", animation: "fadeUp 0.5s" }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "💪" : "📚"}</div>
          <div style={{ fontWeight: 800, fontSize: 28, color: pct >= 80 ? "#F7C948" : "#9ca3af", marginBottom: 10, letterSpacing: 2 }}>
            {pct >= 80 ? "EXCELENTE!" : pct >= 60 ? "BOM TRABALHO!" : "CONTINUE ESTUDANDO!"}
          </div>
          <div style={{ color: "#d1d5db", fontSize: 18, marginBottom: 6 }}>{score}/{battleQuestions.length} corretas — {pct}%</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <button onClick={() => setMode("menu")} style={{ padding: "14px 32px", background: "linear-gradient(135deg, #F7C948, #f97316)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>⚔️ Nova Batalha</button>
            <button onClick={onBack} style={{ padding: "14px 32px", background: "rgba(107,114,128,0.1)", border: "1px solid #374151", borderRadius: 14, color: "#9ca3af", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🏠 Menu Principal</button>
          </div>
        </div>
      );
    }

    const q = battleQuestions[idx];
    const correctIdx = typeof q.correct === "number" ? q.correct : (Array.isArray(q.correct) ? q.correct[0] : 0);

    return (
      <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeUp 0.5s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => setMode("menu")} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>← SAIR</button>
          <div style={{ color: "#F7C948", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{score}/{idx + 1} de {battleQuestions.length}</div>
        </div>

        <div style={{ height: 5, background: "#0a0f1e", borderRadius: 99, marginBottom: 22, overflow: "hidden", border: "1px solid #1a2040" }}>
          <div style={{ height: "100%", width: `${((idx + 1) / battleQuestions.length) * 100}%`, background: "linear-gradient(90deg, #F7C948, #f97316)", borderRadius: 99, transition: "width 0.6s" }} />
        </div>

        {q.domain && (
          <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(247,201,72,0.08)", border: "1px solid #F7C94822", borderRadius: 20, color: "#F7C948", fontSize: 10, fontFamily: "monospace", marginBottom: 14 }}>
            {domainLabels[q.domain] || q.domain}
          </div>
        )}

        <div style={{ color: "#f3f4f6", fontSize: 15, lineHeight: 1.8, marginBottom: 22, fontWeight: 500, animation: shake ? "shakeEl 0.5s" : "none" }}>{q.text}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            let bg = "rgba(255,255,255,0.02)", border = "#1a2040", color = "#9ca3af";
            if (answered) {
              if (i === correctIdx) { bg = "rgba(0,201,167,0.1)"; border = "#00C9A7"; color = "#00C9A7"; }
              else if (i === selected) { bg = "rgba(239,68,68,0.1)"; border = "#ef4444"; color = "#ef4444"; }
            }
            return (
              <button key={i} onClick={() => pick(i)}
                style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 18px", color, fontSize: 14, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "all 0.2s", lineHeight: 1.5 }}
                onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = "#F7C94888"; e.currentTarget.style.color = "#e5e7eb"; } }}
                onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = "#1a2040"; e.currentTarget.style.color = "#9ca3af"; } }}>
                <span style={{ opacity: 0.3, marginRight: 10, fontFamily: "monospace" }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ background: selected === correctIdx ? "rgba(0,201,167,0.06)" : "rgba(247,201,72,0.06)", border: `1px solid ${selected === correctIdx ? "#00C9A733" : "#F7C94833"}`, borderRadius: 14, padding: "18px 20px", color: "#d1d5db", fontSize: 13, lineHeight: 1.8, marginBottom: 16, animation: "fadeUp 0.4s" }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: selected === correctIdx ? "#00C9A7" : "#F7C948" }}>
              {selected === correctIdx ? "✨ Correto!" : "📖 Explicação:"}
            </div>
            {q.explanation}
          </div>
        )}

        {answered && (
          <button onClick={next} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg, #F7C948, #f97316)", border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", animation: "fadeUp 0.3s" }}>
            {idx + 1 >= battleQuestions.length ? "🏁 Ver Resultado" : "Próxima Questão →"}
          </button>
        )}
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════
// ADVENTURE SCREENS
// ═══════════════════════════════════════════════════════════
function WorldMap({ cities, hero, xp, level, completedLessons, completedChallenges, onCityClick }) {
  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: "#374151", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>✦ AS CIDADES DO CÉU DE ESCORPIÃO ✦</div>
        <div style={{ color: hero.color, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{hero.art} {hero.name}</div>
        <div style={{ maxWidth: 360, margin: "0 auto" }}><XPBar xp={xp} level={level} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18, marginBottom: 28 }}>
        {cities.map(city => {
          const lessonsComplete = city.lessons.filter(l => completedLessons.has(l.id)).length;
          const challengeDone = completedChallenges.has(city.id);
          const unlocked = !city.locked;
          const pct = city.lessons.length > 0 ? Math.round((lessonsComplete / city.lessons.length) * 100) : 0;
          return (
            <div key={city.id} onClick={() => unlocked && onCityClick(city)}
              style={{ borderRadius: 18, padding: "22px", cursor: unlocked ? "pointer" : "not-allowed", background: "rgba(10,15,30,0.9)", border: `1.5px solid ${unlocked ? city.color + "55" : "#1a2040"}`, opacity: unlocked ? 1 : 0.4, transition: "all 0.3s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { if (unlocked) { e.currentTarget.style.borderColor = city.color; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 16px 50px ${city.glow}`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = unlocked ? city.color + "55" : "#1a2040"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              {unlocked && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#0a0f1e" }}><div style={{ height: "100%", width: `${pct}%`, background: city.color, transition: "width 0.8s" }} /></div>}
              {!unlocked && <div style={{ position: "absolute", top: 12, right: 12, fontSize: 14 }}>🔒</div>}
              {challengeDone && <div style={{ position: "absolute", top: 12, right: 12, fontSize: 14 }}>🏆</div>}
              <div style={{ fontSize: 36, marginBottom: 10 }}>{city.emoji}</div>
              <div style={{ color: city.color, fontWeight: 800, fontSize: 15, marginBottom: 3, letterSpacing: 1 }}>{city.name}</div>
              <div style={{ color: "#374151", fontSize: 11, marginBottom: 6, fontFamily: "monospace" }}>{city.subtitle}</div>
              <div style={{ color: "#4b5563", fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>{city.domain}</div>
              {unlocked && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: city.color, fontSize: 10, fontFamily: "monospace" }}>{lessonsComplete}/{city.lessons.length} lições</div>
                  <div style={{ color: challengeDone ? "#F7C948" : "#374151", fontSize: 10, fontFamily: "monospace" }}>{challengeDone ? "✓ CONQUISTADA" : "BOSS AGUARDA"}</div>
                </div>
              )}
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
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 22, fontFamily: "monospace" }}>← MAPA MUNDIAL</button>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{city.emoji}</div>
        <h2 style={{ color: city.color, fontWeight: 800, fontSize: 24, letterSpacing: 2, marginBottom: 4 }}>{city.name}</h2>
        <div style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", marginBottom: 6 }}>{city.subtitle.toUpperCase()}</div>
        <div style={{ color: "#4b5563", fontSize: 13 }}>{city.domain}</div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: "#1a2040" }} />
          <span style={{ color: "#374151", fontSize: 11, fontFamily: "monospace", letterSpacing: 3 }}>TRILHA DE ESTUDOS</span>
          <div style={{ height: 1, flex: 1, background: "#1a2040" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {city.lessons.map((lesson, idx) => {
            const done = completedLessons.has(lesson.id);
            const prev = idx === 0 || completedLessons.has(city.lessons[idx - 1].id);
            return (
              <div key={lesson.id} onClick={() => prev && onLesson(lesson)}
                style={{ borderRadius: 14, padding: "16px 18px", cursor: prev ? "pointer" : "not-allowed", background: "rgba(10,15,30,0.9)", border: `1.5px solid ${done ? city.color + "88" : prev ? city.color + "33" : "#1a2040"}`, opacity: prev ? 1 : 0.4, transition: "all 0.3s", display: "flex", alignItems: "center", gap: 14 }}
                onMouseEnter={e => { if (prev) e.currentTarget.style.borderColor = city.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = done ? city.color + "88" : prev ? city.color + "33" : "#1a2040"; }}>
                <div style={{ fontSize: 26, width: 40, textAlign: "center" }}>{done ? "✅" : lesson.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: done ? city.color : "#e5e7eb", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{lesson.title}</div>
                  <div style={{ color: "#4b5563", fontSize: 12 }}>{lesson.concept}</div>
                </div>
                <div style={{ color: city.color + "88", fontSize: 11, fontFamily: "monospace" }}>{done ? `+${XP_LESSON}xp ✓` : prev ? "→" : "🔒"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderRadius: 18, padding: "24px", background: "rgba(10,15,30,0.95)", border: `2px solid ${allLessonsDone ? city.color : "#1a2040"}`, opacity: allLessonsDone ? 1 : 0.5, textAlign: "center", transition: "all 0.5s", boxShadow: allLessonsDone ? `0 0 40px ${city.glow}` : "none" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>{completedChallenge ? "🌟" : allLessonsDone ? city.bossEmoji : "🌀"}</div>
        <div style={{ color: allLessonsDone ? city.color : "#374151", fontWeight: 800, fontSize: 16, marginBottom: 6, letterSpacing: 1 }}>
          {completedChallenge ? "CIDADE CONQUISTADA!" : allLessonsDone ? `BOSS: ${city.bossName}` : "PORTAL SELADO"}
        </div>
        <div style={{ color: "#4b5563", fontSize: 13, marginBottom: allLessonsDone ? 18 : 0, lineHeight: 1.6 }}>
          {completedChallenge ? `${hero.name} dominou ${city.name}. O portal para a próxima cidade brilha.` : allLessonsDone ? city.bossDesc : "Complete todas as lições para desselar o portal."}
        </div>
        {allLessonsDone && !completedChallenge && (
          <button onClick={onChallenge} style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", letterSpacing: 1 }}>
            ⚔️ ENFRENTAR O BOSS
          </button>
        )}
        {completedChallenge && (
          <button onClick={onBack} style={{ padding: "14px 32px", background: "rgba(247,201,72,0.1)", border: "1px solid #F7C94866", borderRadius: 12, color: "#F7C948", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            🗺️ Voltar ao Mapa
          </button>
        )}
      </div>
    </div>
  );
}

function LessonView({ lesson, city, hero, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const total = lesson.keyPoints.length + 2;
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, marginBottom: 22, fontFamily: "monospace" }}>← {city.name}</button>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 30 }}>{lesson.icon}</div>
        <div>
          <div style={{ color: city.color, fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>{lesson.title}</div>
          <div style={{ color: "#4b5563", fontSize: 12 }}>{lesson.concept}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < step ? city.color : "#1a2040", transition: "background 0.4s" }} />
        ))}
      </div>
      <div style={{ borderRadius: 18, padding: "28px 24px", background: "rgba(10,15,30,0.95)", border: `1.5px solid ${city.color}33`, marginBottom: 20, minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }} key={step}>
        {step < lesson.keyPoints.length && (
          <>
            <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>CONCEITO {step + 1}/{lesson.keyPoints.length}</div>
            <div style={{ color: city.color, fontWeight: 800, fontSize: 17, marginBottom: 12 }}>{lesson.keyPoints[step].label}</div>
            <div style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.8 }}>{lesson.keyPoints[step].text}</div>
          </>
        )}
        {step === lesson.keyPoints.length && (
          <>
            <div style={{ fontSize: 11, color: "#374151", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>🗺️ {hero.name.toUpperCase()} ENCONTRA UM ANCIÃO</div>
            <div style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic", lineHeight: 1.8, background: `${city.color}0a`, border: `1px solid ${city.color}22`, borderRadius: 12, padding: "14px 18px" }}>"{lesson.analogy}"</div>
          </>
        )}
        {step === lesson.keyPoints.length + 1 && (
          <>
            <div style={{ fontSize: 11, color: "#F7C948aa", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>⚡ DICA DO EXAME</div>
            <div style={{ color: "#F7C948", fontWeight: 700, fontSize: 15, lineHeight: 1.8, background: "#F7C9480a", border: "1px solid #F7C94822", borderRadius: 12, padding: "14px 18px" }}>{lesson.tip}</div>
            <div style={{ color: "#4b5563", fontSize: 12, marginTop: 14, fontFamily: "monospace" }}>+{XP_LESSON} XP ao completar</div>
          </>
        )}
      </div>
      {step < total ? (
        <button onClick={() => setStep(s => s + 1)} style={{ width: "100%", padding: "15px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {step < lesson.keyPoints.length ? "Próximo Conceito →" : step === lesson.keyPoints.length ? "Ver Dica do Exame →" : "Completar Lição ✓"}
        </button>
      ) : (
        <button onClick={onComplete} style={{ width: "100%", padding: "15px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          ✨ Resgatar +{XP_LESSON} XP →
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

  const q = city.questions[idx];

  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore(s => s + 1);
    else { setShake(true); setTimeout(() => setShake(false), 600); }
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
      <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 540, margin: "0 auto", animation: "fadeUp 0.5s" }}>
        <div style={{ fontSize: 76, marginBottom: 18 }}>{won ? "🏆" : "💪"}</div>
        <div style={{ fontWeight: 800, fontSize: 26, color: won ? "#F7C948" : city.color, marginBottom: 10, letterSpacing: 2 }}>
          {won ? `${city.bossName} DERROTADO!` : "CONTINUE TREINANDO!"}
        </div>
        <div style={{ color: "#6b7280", fontSize: 15, marginBottom: 6 }}>{score}/{city.questions.length} corretas — {pct}%</div>
        <div style={{ color: "#F7C948", fontSize: 15, marginBottom: 28, fontFamily: "monospace" }}>+{gained} XP ⚡</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onComplete(score, city.questions.length)} style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {won ? "🗺️ Mapa Mundial →" : "🗺️ Voltar ao Mapa"}
          </button>
          {!won && (
            <button onClick={() => { setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); }} style={{ padding: "14px 24px", background: "rgba(247,201,72,0.1)", border: "1px solid #F7C94844", borderRadius: 12, color: "#F7C948", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              🔄 Tentar Novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.5s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#4b5563", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>← RECUAR</button>
        <div style={{ color: city.color, fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>{city.bossEmoji} {city.bossName}</div>
        <div style={{ color: "#F7C948", fontFamily: "monospace", fontSize: 12 }}>⚔️ {score}/{city.questions.length}</div>
      </div>
      <div style={{ height: 5, background: "#0a0f1e", borderRadius: 99, marginBottom: 20, overflow: "hidden", border: "1px solid #1a2040" }}>
        <div style={{ height: "100%", width: `${100 - (idx / city.questions.length) * 100}%`, background: "linear-gradient(90deg, #ef4444, #F7C948)", borderRadius: 99, transition: "width 0.6s" }} />
      </div>
      {q.analogy && <div style={{ background: `${city.color}0d`, border: `1px solid ${city.color}22`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#6b7280", fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>{q.analogy}</div>}
      <div style={{ color: "#f3f4f6", fontSize: 15, lineHeight: 1.8, marginBottom: 20, fontWeight: 500, animation: shake ? "shakeEl 0.5s" : "none" }}>{q.text}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
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
        <div style={{ background: selected === q.correct ? "rgba(0,201,167,0.06)" : "rgba(247,201,72,0.06)", border: `1px solid ${selected === q.correct ? "#00C9A733" : "#F7C94833"}`, borderRadius: 14, padding: "16px 20px", color: "#d1d5db", fontSize: 13, lineHeight: 1.8, marginBottom: 16, animation: "fadeUp 0.4s" }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: selected === q.correct ? "#00C9A7" : "#F7C948" }}>{selected === q.correct ? "✨ Feitiço dominado!" : "📖 Aprenda o feitiço:"}</div>
          {q.explanation}
        </div>
      )}
      {answered && (
        <button onClick={next} style={{ width: "100%", padding: 16, background: `linear-gradient(135deg, ${city.color}, ${city.color}99)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {idx + 1 >= city.questions.length ? "⚔️ Finalizar Batalha" : "Próximo Ataque →"}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("char");
  const [hero, setHero] = useState(null);
  const [appMode, setAppMode] = useState(null); // "adventure" | "arena"
  const [cities, setCities] = useState(CITIES);
  const [activeCity, setActiveCity] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState(null);

  const level = Math.floor(xp / 500) + 1;

  const showToast = (msg, color = "#00C9A7") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCharSelect = (c, mode) => {
    setHero(c);
    setAppMode(mode);
    setScreen(mode === "adventure" ? "map" : "arena");
    showToast(`Bem-vinda, ${c.name}! ${mode === "adventure" ? "🗺️" : "⚔️"}`, c.color);
  };

  const handleLessonComplete = () => {
    if (!completedLessons.has(activeLesson.id)) {
      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
      setXp(x => x + XP_LESSON);
      showToast(`+${XP_LESSON} XP! Lição completa! ✨`, activeCity.color);
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
        showToast(`🌟 ${cities[idx + 1].name} DESBLOQUEADA!`, "#F7C948");
      } else {
        showToast("🏆 TODAS AS CIDADES CONQUISTADAS! Você é um Arquiteto de Dados!", "#F7C948");
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
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1a2040; border-radius: 2px; }
        button { font-family: 'Raleway', sans-serif; }
        input { font-family: 'Raleway', sans-serif; }
      `}</style>

      <Stars />

      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#04080f", border: `1px solid ${toast.color}`, borderRadius: 12, padding: "12px 24px", color: toast.color, fontWeight: 700, fontSize: 13, zIndex: 9999, animation: "fadeUp 0.4s ease", boxShadow: `0 0 30px ${toast.color}33`, fontFamily: "monospace", whiteSpace: "nowrap" }}>
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
            {hero && screen !== "char" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                <div style={{ color: hero.color, fontWeight: 700, fontSize: 13 }}>{hero.art} {hero.name}</div>
                {appMode === "adventure" && (
                  <div style={{ maxWidth: 260, width: "100%" }}><XPBar xp={xp} level={level} /></div>
                )}
                <button onClick={() => { setScreen("char"); setAppMode(null); }} style={{ background: "none", border: "1px solid #1a2040", borderRadius: 8, color: "#374151", padding: "4px 12px", cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                  TROCAR MODO
                </button>
              </div>
            )}
          </div>

          {screen === "char" && <CharacterSelect onSelect={handleCharSelect} />}
          {screen === "arena" && <Arena hero={hero} onBack={() => setScreen("char")} />}
          {screen === "map" && <WorldMap cities={cities} hero={hero} xp={xp} level={level} completedLessons={completedLessons} completedChallenges={completedChallenges} onCityClick={city => { setActiveCity(city); setScreen("city"); }} />}
          {screen === "city" && <CityView city={activeCity} hero={hero} completedLessons={completedLessons} completedChallenge={completedChallenges.has(activeCity?.id)} onLesson={lesson => { setActiveLesson(lesson); setScreen("lesson"); }} onChallenge={() => setScreen("boss")} onBack={() => setScreen("map")} />}
          {screen === "lesson" && <LessonView lesson={activeLesson} city={activeCity} hero={hero} onComplete={handleLessonComplete} onBack={() => setScreen("city")} />}
          {screen === "boss" && <BossFight city={activeCity} hero={hero} onComplete={handleBossComplete} onBack={() => setScreen("city")} />}

        </div>
      </div>
    </>
  );
}
