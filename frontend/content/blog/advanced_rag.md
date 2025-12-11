---
title: Advanced RAG
date: 2025-12-11
description: 重点聚焦于检索增强
tags:
  - rag
  - llm
---
### 2.5 Advanced RAG

重点聚焦于检索增强

#### 2.5.1 Pre-Retrieval预检索优化--优化索引

- 摘要索引：将摘要embedding存入向量库，原始文档存在字节存储，匹配，通过关联id获取原始文档（适用于非结构化数据，像表格等）
- 父子索引：分割成层级化的块结构，最小叶子块索引，检索top k个叶子块，指向同一父块，将父块传给llm
<img src="/images/blog/advanced_rag/壁纸__55_.jpg" alt="壁纸__55_" style="zoom: 67%;" />
- 假设性问题索引：让llm对每个块生成3个假设性问题，并将这些问题存入向量数据库<img src="assets/image-20251112114052597.png" alt="image-20251112114052597" style="zoom:50%;" />
- 元数据索引：对每一个文档定义元数据（标签），通过标签来先对文档进行过滤，然后结合向量检索来定位前K个知识块。

<img src="assets/image-20251113110413827.png" alt="image-20251113110413827" style="zoom: 67%;" />

#### 2.5.2 Pre-Retrieval预检索优化--查询优化

- enrich完善问题：大模型多次主动沟通用户，不断收集信息，完善对用户意图的了解。
- Multi-Query 多路召回：利用llm生成N个与原始查询相关的问题，所有问题发给检索系统，在向量库中检索更多文档。
- Decomposition 问题分解：运用提示词里的CoT策略，将用户复杂的问题拆分成一个一个小问题来理解，串行或并行来执行子任务，最后将所有答案来进行汇总。

<img src="assets/image-20251113114139408.png" alt="image-20251113114139408" style="zoom: 67%;" />

#### 2.5.3 检索优化--混合检索

使用LangChain内部给的轮子即可

<img src="assets/image-20251113115719948.png" alt="image-20251113115719948" style="zoom: 67%;" />

#### 2.5.4 Pre-Retrieval后检索优化

- 重排序：可以使用模型或者算法来实现

- RAG-Fusion：倒数排名融合（RRF）算法

  - <img src="assets/image-20251114145907930.png" alt="image-20251114145907930" style="zoom:50%;" />

  - <img src="assets/image-20251114145327512.png" alt="image-20251114145327512" style="zoom:50%;" />

- 上下文压缩和过滤：精简并淘汰与查询不相干的部分，避免更昂贵的LLM调用和较差的响应

#### 2.5.5 Advanced RAG实战--金融助手

- 摘要索引