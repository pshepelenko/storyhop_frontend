# Git (frontend)

Отдельный репозиторий только для `frontend/`. Корень `Storyhop/` не является git-репозиторием.

## Быстрые команды

Из папки `frontend/`:

```powershell
.\git.ps1 status
.\git.ps1 add .
.\git.ps1 commit -m "описание изменений"
.\git.ps1 restore path/to/file      # откат одного файла
.\git.ps1 restore .                 # откат всех незакоммиченных изменений
.\git.ps1 log --oneline -10
```

`git.ps1` подставляет локальный `.gitconfig.local` (обход `safe.directory` на Windows без правки глобального git config).

Обычный `git` тоже можно использовать после однократной настройки:

```powershell
git config --global --add safe.directory C:/Users/User/Documents/Storyhop/frontend
```

## Remote

Сейчас: `origin` → `https://github.com/pshepelenko/fairy-tail-frontend.git` (ветка `master`).

Чтобы сменить remote на новый репозиторий StoryHop:

```powershell
.\git.ps1 remote set-url origin https://github.com/YOU/storyhop-frontend.git
```
