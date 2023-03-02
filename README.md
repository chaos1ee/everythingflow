# Everything will flow

## Workflow

1. 每次变更代码后在本地仓库的根目录中执行 pnpm changeset，然后提交代码并将代码推到远端;
2. 在仓库 https://github.com/chaos1ee/everythingflow 内创建提交到 master 分支的 PR，随后合并；
3. 上一步合并的 PR 会触发 Github Actions，当 GitHub Actions 执行成功之后会自动发起一个新的 PR（从 changeset-release/master 分支到 master 分支的 PR），合并这个 PR ，等待 GitHub Actions 再次执行成功后自动发版就完成了。
