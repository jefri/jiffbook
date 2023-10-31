export const singleStyle = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Orbitron:wght@400;700&family=Poppins:ital,wght@0,400;0,700;1,400;1,700&display=swap');

:root {
  --font-family-base: Poppins;
  --font-family-header: Orbitron;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

body > main {
  flex-grow: 1;
  width: 100%;
}

.cover {
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

@media (prefers-color-scheme: dark) {
  a, [role=link] {
    --text-color: #BBBBFF;
  }
}

nav .breadcrumbs li {
  display: inline-block;
  margin-left: 1em;
}

nav .breadcrumbs li::marker {
  content: '→';
}

:is(body,#body,#root)>aside:has(>nav) {
  width: min-content;
}

:is(body,#body,#root)>aside>nav {
  max-height: 90vh;
  overscroll-behavior: contain;
  overflow: scroll;
}

aside nav ul li a {
  white-space: nowrap;
}

.table-of-contents {
  container-type: size;

  & > ol {
    columns: var(--text-columns);
  }
}

.table-of-contents {
  --text-columns: 1;
}

@container (width > 600px) {
  .table-of-contents > ol {
    --text-columns: 3;
  }
}

@container (width > 400px) {
  .table-of-contents > ol {
    --text-columns: 2;
  }
}

`;
