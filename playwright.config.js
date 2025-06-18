// playwright.config.js
const { devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  // Configuración global
  timeout: 60 * 1000, // Tiempo máximo por test
  expect: { timeout: 10000 }, // Tiempo máximo para expect
  retries: process.env.CI ? 2 : 0, // Reintentos en CI
  workers: process.env.CI ? 4 : '50%', // Paralelismo
  fullyParallel: true, // Ejecutar tests en paralelo
  reporter: [
    ['list'], // Reportero de consola
    ['html', { outputFolder: 'playwright-report' }], // Reporte HTML
    ['junit', { outputFile: 'test-results/results.xml' }] // Reporte JUnit para CI
  ],
  use: {
    // Configuración base
    baseURL: 'http://localhost:5000',
    headless: process.env.HEADLESS !== 'false', // Headless por defecto
    trace: 'retain-on-failure', // Capturar traces en fallos
    screenshot: 'only-on-failure', // Capturar screenshots en fallos
    video: 'retain-on-failure', // Grabar video en fallos
    viewport: { width: 1280, height: 720 }, // Viewport por defecto
    ignoreHTTPSErrors: true,
    colorScheme: 'light',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Configurar servidor local para desarrollo
  webServer: {
    command: 'python server.py',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe'
  },

  // Proyectos para diferentes configuraciones
  projects: [
    // Configuración desktop
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Configuración mobile
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 13'] },
    },

    // Configuración específica para CI
    ...(process.env.CI ? [
      {
        name: 'ci-chromium',
        use: { 
          ...devices['Desktop Chrome'],
          // Configuración específica para CI
          launchOptions: {
            args: ['--disable-dev-shm-usage', '--no-sandbox']
          }
        },
      }
    ] : []),

    // Configuración de accesibilidad
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Herramientas para auditoría de accesibilidad
        contextOptions: {
          serviceWorkers: 'block'
        }
      },
      testIgnore: /.*\.a11y\.spec\.js/,
    }
  ],

  // Directorios de configuración
  outputDir: 'test-results/',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  
  // Configuración de plugins
  plugins: [
    {
      name: 'user-auth',
      async setup() {
        // Plugin para autenticación
      }
    }
  ]
};

module.exports = config;

