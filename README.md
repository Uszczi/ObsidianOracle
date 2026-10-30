# Oracle Syntax Highlight (Obsidian)

Podświetlanie składni Oracle SQL, PL/SQL i SQL*Plus w blokach kodu — w trybie czytania oraz w edytorze (Live Preview / Source).

````markdown
```plsql
SET SERVEROUTPUT ON
DECLARE
  v_name employees.last_name%TYPE;
BEGIN
  SELECT /*+ INDEX(e emp_idx) */ last_name INTO v_name
  FROM employees e WHERE employee_id = :id;
  DBMS_OUTPUT.PUT_LINE(q'[Name: ]' || v_name);
EXCEPTION
  WHEN NO_DATA_FOUND THEN NULL;
END;
/
```
````

Języki bloków: `oracle`, `plsql`, `ora`, `oraclesql` (konfigurowalne). Opcjonalnie także `sql`.

Rozpoznaje: słowa kluczowe, typy, funkcje wbudowane, pakiety (`DBMS_*`, `UTL_*`, `APEX_*`…), wyjątki,
q-quote (`q'[...]'`), hinty `/*+ */`, zmienne `:bind` i `&subst`, atrybuty `%TYPE`/`%ROWTYPE`,
etykiety `<<label>>`, komendy SQL*Plus (`SET`, `PROMPT`, `REM`, `@skrypt`, `/`, `EXEC`…).

Kolory pochodzą z motywu (`--code-*`). Klasy CSS (`.ora-keyword`, `.ora-string`, `.ora-package`, …)
można nadpisać snippetem CSS.

## Formatowanie

- Komenda **„Format Oracle code (selection or block under cursor)”**: formatuje zaznaczenie, a bez zaznaczenia blok pod kursorem.
  Warto przypisać jej skrót w *Ustawienia → Skróty klawiszowe*.
- Komenda **„Format all Oracle code blocks in this note”**: formatuje wszystkie bloki Oracle w notatce.
- Przycisk **Format** obok **Copy** w trybie czytania (można wyłączyć).

Ustawienia: wielkość liter słów kluczowych (UPPER / lower / bez zmian), wcięcie (2 lub 4 spacje albo tab).
Identyfikatory, napisy i komentarze nie są zmieniane. Linie SQL*Plus (`SET`, `PROMPT`, `/`…) zostają bez zmian.

## Build

```bash
npm install
npm run build   # main.js
npm test        # testy tokenizera
```

Instalacja: skopiuj `main.js`, `manifest.json`, `styles.css` do
`<vault>/.obsidian/plugins/oracle-syntax-highlight/` i włącz plugin w ustawieniach.
