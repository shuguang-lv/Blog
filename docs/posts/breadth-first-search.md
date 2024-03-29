---
layout: Post
title: Breadth-first Search
subtitle: 算法实现, 深搜vs广搜, 双向广度优先搜索
author: Desmond
date: 2020-07-26 23:13:18
useHeaderImage: true
headerImage: https://6772-grp2020-4glv8fo5cd87cf9a-1302562267.tcb.qcloud.la/head-images/head.jpg?sign=9e9d43ea7192eae549023aca13b689ce&t=1653747029
headerMask: rgba(45, 55, 71, .5)
permalinkPattern: /post/:year/:month/:day/:slug/
tags: [Algorithm]
---

## 广度优先搜索

---

### 算法（利用 Queue）

![](https://6772-grp2020-4glv8fo5cd87cf9a-1302562267.tcb.qcloud.la/breadth-first-search/bfs.png?sign=1de7ef191afedd5e20337f9529afe766&t=1622129349)

可确保找到最优解，但是因扩展出 来的节点较多，且多数节点都需要保存，因此需要的存储空间较大。用队列存节点。

### 广搜 vs 深搜

- 广搜一般用于**状态表示比较简单、求最优策略**的问题
  - [优点] 是一种**完备**策略，即只要问题有解，它就一定可以找到解 。并且，广度优先搜索找到的解，还一定是路径**最短**的解。
  - [缺点] 盲目性较大，尤其是当目标节点距初始节点较远时，将产生许多无用的节点，因此其搜索效率较低。需要保存所有扩展出的状态，占用的空间大 。
- 深搜几乎可以用于任何问题 (只需要保存从起始状态到当前状态路径上的节点)

### 双向广度优先搜索（DBFS）

从两个方向以广度优先的顺序同时扩展，一个是从起始节点开始扩展，另一个是从目的节点扩展，直到一个扩展队列中出现另外一个队列中已经扩展的节点，也就相当于两个扩展方向出现了交点，那 么可以认为我们找到了一条路径。

- DBFS 算法相对于 BFS 算法来说，由于采用了双向扩展的方式，搜索树的宽度得到了明显的减少，所以在算法的时间复杂度和空间复杂度上都有较大的优势！

- 假设 1 个结点能扩展出 n 个结点，单向搜索要 m 层能找到答案，那么扩展出来的节点数目就是:
  {% mathjax %}
  (1-n^m)/(1-n)
  {% endmathjax %}
- 双向广搜，同样是一共扩展 m 层，假定两边各扩展出 m/2 层，则总结点数目是:
  {% mathjax %}
  2\*(1-n^{m/2})/(1-n)
  {% endmathjax %}

- 每次扩展结点总是选择结点比较少的那边进行扩展，并不是机械的两边交替。

- **框架:**

  ```c
  void dbfs()
  {
      1.将起始节点放入队列q0, 将目标节点放入队列q1;
      2.当两个队列都未空时, 作如下循环:
          1) 如果队列q0里的节点比q1中的少, 则扩展队列q0;
      	2) 否则扩展队列q1
      3.如果队列q0未空, 不断扩展q0直到为空;
      4.如果队列q1未空, 不断扩展q1直到为空;
  }

  // i为队列的编号0或1
  int expand(i)
  {
      取队列qi的头结点H;
      对H的每一个相邻节点adj:
      	1.如果adj已经在队列qi之中出现过, 则抛弃adj;
      	2.如果adj在队列qi中未出现过, 则:
      		1) 将adj放入队列qi;
      		2) 如果adj曾在队列q1-i中出现过, 则输出找到的路径
  }

  // 需要两个标志序列, 分别记录节点是否出现在两个队列中
  ```

---

#### [**Catch That Cow**](http://poj.org/problem?id=3278)

```c
#include <iostream>
#include <cstring>
#include <queue>
using namespace std;

int N, K;
const int MAXN = 100000;
int visited[MAXN + 10] = {0}; // 判重

struct Step
{
    int x;     // 位置
    int steps; // 到达x所需步数
    Step(int xx, int ss) : x(xx), steps(ss) {}
};

queue<Step> q; // 队列 - open表

int main()
{
    cin >> N >> K;
    q.push(Step(N, 0));
    visited[N] = 1;

    while (!q.empty())
    {
        Step s = q.front();

        if (s.x == K)
        {
            cout << s.steps << endl;
            return 0;
        }
        else
        {
            if (s.x - 1 >= 0 && !visited[s.x - 1])
            {
                q.push(Step(s.x - 1, s.steps + 1));
                visited[s.x - 1] = 1;
            }

            if (s.x + 1 <= MAXN && !visited[s.x + 1])
            {
                q.push(Step(s.x + 1, s.steps + 1));
                visited[s.x + 1] = 1;
            }

            if (s.x * 2 <= MAXN && !visited[s.x * 2])
            {
                q.push(Step(s.x * 2, s.steps + 1));
                visited[s.x * 2] = 1;
            }

            q.pop();
        }
    }
}
```

---

#### [迷宫问题](http://bailian.openjudge.cn/practice/4127)

**思路**：

- 基础广搜。先将起始位置入队列
- 每次从队列拿出一个元素，扩展其相邻的 4 个元素入队列 （要判重）， 直到队头元素为终点为止。队列里的元素记录了指向父节点（上一步）的指针
- 队列不能用 STL 的 queue 或 deque，要自己写。用一维数组实现，维护一个队头指针和队尾指针

```c
#include <iostream>
#include <vector>
using namespace std;

int maze[5][5];
int visited[5][5] = {0}; // 判重

struct Pos
{
    int r, c; // 位置
    int f;
} queue[25];

int head = 0;
int tail = 0;
int current = 0;

int main()
{
    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            cin >> maze[i][j];
        }
    }

    queue[head].r = 0;
    queue[head].c = 0;
    queue[head].f = -1;
    current++;
    visited[0][0] = 1;

    while (head <= tail)
    {
        Pos p = queue[head];

        if (p.r == 4 && p.c == 4)
        {
            vector<Pos> path;
            while (p.f != -1)
            {
                path.push_back(p);
                p = queue[p.f];
            }
            path.push_back(p);

            for (int i = path.size() - 1; i >= 0; i--)
            {
                cout << "(" << path[i].r << ", " << path[i].c << ")" << endl;
            }

            return 0;
        }
        else
        {
            int f = head;
            head++;

            if (p.r - 1 >= 0 && maze[p.r - 1][p.c] != 1 && !visited[p.r - 1][p.c])
            {
                queue[current].r = p.r - 1;
                queue[current].c = p.c;
                queue[current].f = f;
                current++;
                tail++;
                visited[p.r - 1][p.c] = 1;
            }

            if (p.r + 1 < 5 && maze[p.r + 1][p.c] != 1 && !visited[p.r + 1][p.c])
            {
                queue[current].r = p.r + 1;
                queue[current].c = p.c;
                queue[current].f = f;
                current++;
                tail++;
                visited[p.r + 1][p.c] = 1;
            }

            if (p.c - 1 >= 0 && maze[p.r][p.c - 1] != 1 && !visited[p.r][p.c - 1])
            {
                queue[current].r = p.r;
                queue[current].c = p.c - 1;
                queue[current].f = f;
                current++;
                tail++;
                visited[p.r][p.c - 1] = 1;
            }

            if (p.c + 1 < 5 && maze[p.r][p.c + 1] != 1 && !visited[p.r][p.c + 1])
            {
                queue[current].r = p.r;
                queue[current].c = p.c + 1;
                queue[current].f = f;
                current++;
                tail++;
                visited[p.r][p.c + 1] = 1;
            }
        }
    }
}
```
