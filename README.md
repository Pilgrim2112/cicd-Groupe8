#Rapport Examen Pipeline CI/CD Avancé - Groupe 8

## Membres du Groupe
* Benit BATOMENE
* Laurfel KAYA

---

## PARTIE 1 : Intégration continue avec GitHub Actions

### 1. Architecture de GitHub Actions

GitHub Actions repose sur une architecture modulaire, distribuée et événementielle permettant d'automatiser les cycles de vie du développement logiciel. 
Elle est structurée autour de cinq composants clés :

*   **Workflows** : Processus automatisés configurés dans un fichier YAML.
*   Un workflow définit l'ensemble du scénario à exécuter (ex: build, test, déploiement) et contient un ou plusieurs jobs.
*   
*   **Jobs** : Unités d'exécution logiques composées d'une série d'étapes (*steps*).
*   Par défaut, les jobs d'un même workflow s'exécutent en parallèle, mais des dépendances peuvent être configurées pour les lier séquentiellement via le mot-clé `needs`.
*   Chaque job s'exécute sur son propre runner dédié.
*   
*   **Steps** : Les steps sont des tâches individuelles exécutées de manière séquentielle au sein d'un même job.
*   Un step peut exécuter une commande système (shell) ou appeler une action réutilisable. Elles partagent le même environnement de système de fichiers.
*   
*   **Actions réutilisables** : Ce sont des composants logiciels autonomes et partagés issus de la communauté ou officiels
*   (ex: `actions/checkout` pour cloner le dépôt, `actions/setup-node` pour installer le runtime), évitant la duplication de code.
*   
*   **Runners** : Serveurs ou conteneurs sur lesquels les jobs sont exécutés.
*   Ils écoutent les jobs disponibles, exécutent les instructions définies et renvoient les journaux et les statuts à l'interface GitHub.


### 2. Emplacement et Déclenchement Événementiel

*   **Rôle du dossier `.github/workflows/`** : Situé obligatoirement à la racine du dépôt Git, ce dossier sert de registre centralisé pour GitHub.
*   Le serveur GitHub analyse automatiquement chaque fichier `.yml` présent dans ce dossier pour instancier et activer les pipelines correspondants.
*   
*   **Déclenchement par événements (`push`, `pull_request`)** : GitHub Actions adopte un paradigme piloté par les événements (Event-Driven).
*    
    *   L'événement **`push`** déclenche automatiquement le workflow dès qu'un développeur pousse des commits vers le dépôt distant, assurant une intégration continue.
    *   L'événement **`pull_request`** se déclenche lors de la création ou de la mise à jour d'une demande de fusion, permettant de valider la stabilité du code proposé par rapport à la branche cible (`main`) avant l'intégration finale.

---

###3. Mise en œuvre progressive des Workflows (Groupe 8)

#### Hello CI
*Fichier : `.github/workflows/hello-ci.yml`*
Ce workflow minimal valide la bonne communication entre notre dépôt Git et l'orchestrateur en exécutant une commande shell simple.
```yaml
name: push_Groupe8

on:
  push:
    branches:
     - main

jobs:
  hello_Groupe8:
    runs-on: ubuntu-latest
    
    steps:
      - name: Dit Hello
        run: echo Hello, CI!
```

#### Cycle de base (Build puis Test)
*Fichier : `.github/workflows/base-cycle.yml`*
Mise en place d'un enchaînement séquentiel où le job de test dépend de la réussite du job build.
```yaml
name: Base_Cycle_Groupe8

on:
  push:
    branches:
      - main

jobs:
  build_Groupe8:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24
      - name: Install Dependencies
        run: npm install

  test_Groupe8:
    needs: build_Groupe8
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24
      - name: Install Dependencies
        run: npm install
      - name: Run Tests
        run: npm test

```

#### Optimisation (Cache et Artefact)
*Fichier : `.github/workflows/optimization.yml`*
Optimisation du pipeline via la mise en cache du dossier de dépendances npm (`~/.npm`) et publication d'un artefact simulé (`dist/`) pour découpler la phase de build de la phase de livraison.
```yaml
name: Optimization_Groupe8

on:
  push:
    branches:
      - main

jobs:
  build_Groupe8:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24

      # Mise en cache des dépendances npm
      - name: Cache Node modules
        uses: actions/cache@v5
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install Dependencies
        run: npm install

      # Simulation de la création d'un livrable (Build)
      - name: Build Application
        run: |
          mkdir dist
          echo "Build du Groupe8 prêt pour le déploiement" > dist/index.html

      # Publication de l'artefact téléchargeable
      - name: Upload Artifact
        uses: actions/upload-artifact@v5
        with:
          name: production-build-Groupe8
          path: dist/

  test_Groupe8:
    needs: build_Groupe8
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24

      - name: Cache Node modules
        uses: actions/cache@v5
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Install Dependencies
        run: npm install

      - name: Run Tests
        run: npm test
```

#### Matrice et Branches (Version finale)
*Fichier : `.github/workflows/matrix-branches.yml`*
Stratégie de test multi-environnements s'exécutant en parallèle sur **Node 22 et Node 24** (stratégie matricielle). Le job de déploiement final intègre une condition stricte (`if`) pour restreindre son exécution exclusive à la branche principale `main`.
```yaml
name: Matrix_Branches_Groupe8

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build_Groupe8:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 22

      - name: Cache Node modules
        uses: actions/cache@v5
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Install Dependencies
        run: npm install

      - name: Build Application
        run: |
          mkdir dist
          echo "Build complet matriciel" > dist/index.html

      # L'artefact servira au déploiement
      - name: Upload Artifact
        uses: actions/upload-artifact@v5
        with:
          name: matrix-build-Groupe8
          path: dist/

  test_Groupe8:
    needs: build_Groupe8
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22, 24] # Exécution en parallèle sur les deux versions
    steps:
      - name: Checkout code
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: ${{ matrix.node-version }}

      - name: Cache Node modules
        uses: actions/cache@v5
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      - name: Install Dependencies
        run: npm install

      - name: Run Tests
        run: npm test

  deploy_Groupe8:
    needs: test_Groupe8
    if: github.ref == 'refs/heads/main' # Condition stricte : uniquement sur main
    runs-on: ubuntu-latest
    steps:
      - name: Download Artifact
        uses: actions/download-artifact@v5
        with:
          name: matrix-build-Groupe8
          path: dist/

      - name: Deploy Production
        run: echo "Déploiement en production réussi pour le Groupe8 !"
```

---

### 4. Protection de la branche principale `main`

Afin de garantir la stabilité de l'environnement de production, un ensemble de règles de dépôt (*Repository Rulesets*) a été configuré sur l'interface GitHub :
1. **Interdiction du push direct** sur la branche `main`.
2. **Obligation de passer par une Pull Request** soumise à relecture.
3. **Exécution obligatoire et passage au vert** des statuts de tests de la CI (`test_Groupe8 (22)` et `test_Groupe8 (24)`) avant de pouvoir débloquer la fusion.

#### Preuves de fonctionnement (Captures d'écran)

*   **Capture 1 : Pull Request Bloquée**
    *   *Description* : Suite à l'introduction volontaire d'une erreur de code de retour attendu (`400` au lieu de `200`) dans le fichier de test `test.js`, le pipeline de la CI a échoué. L'interface GitHub affiche un statut de vérification rouge et le bouton de fusion de la Pull Request est techniquement verrouillé.
    *   <img width="964" height="418" alt="pr-bloqué" src="https://github.com/user-attachments/assets/12f36321-5de1-469b-9190-dee6e9f692aa" />

*

*   **Capture 2 : Pull Request Débloquée**
    *   *Description* : Après application du correctif restaurant le code de retour valide (`200`) sur la branche de fonctionnalité et push des modifications, le pipeline s'est relancé automatiquement. Les tests matriciels sont passés au vert ("All checks have passed") et le bouton vert de fusion est devenu accessible.
    *   <img width="996" height="495" alt="pr-debloqué" src="https://github.com/user-attachments/assets/86458455-5a82-4616-96c9-8f9297eca084" />

