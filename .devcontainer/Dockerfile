FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# ── System dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    curl \
    git \
    zsh \
    iptables \
    iproute2 \
    dnsutils \
    fzf \
    jq \
    ripgrep \
    bubblewrap \
    socat \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Node.js 24 LTS ────────────────────────────────────────────────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── GitHub CLI (gh) ────────────────────────────────────────────────────────────
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Python 3 ──────────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Shell history persistence ──────────────────────────────────────────────────
RUN mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && touch /commandhistory/.zsh_history \
    && chown -R vscode /commandhistory

# ── Firewall script ────────────────────────────────────────────────────────────
COPY .devcontainer/init-firewall.sh /devcontainer/init-firewall.sh
RUN chmod +x /devcontainer/init-firewall.sh

# ── Shell setup ────────────────────────────────────────────────────────────────
RUN chsh -s /bin/zsh vscode \
    && echo 'export HISTFILE=/commandhistory/.zsh_history' >> /home/vscode/.zshrc \
    && echo 'export HISTSIZE=10000' >> /home/vscode/.zshrc \
    && echo 'export SAVEHIST=10000' >> /home/vscode/.zshrc \
    && echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/vscode/.zshrc \
    && echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/vscode/.bashrc

# ── Sudo permission for firewall script ───────────────────────────────────────
RUN echo "vscode ALL=(root) NOPASSWD: /bin/bash /devcontainer/init-firewall.sh" \
    >> /etc/sudoers.d/vscode-firewall \
    && chmod 0440 /etc/sudoers.d/vscode-firewall

# ── uv (Python package manager) ───────────────────────────────────────────────
# Installed via PyPI (astral.sh is blocked by the firewall; pypi.org is whitelisted).
# pip install --user puts the binary in /home/vscode/.local/bin which is already in PATH.
USER vscode
RUN pip install --user --break-system-packages uv
