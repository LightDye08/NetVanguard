const { test, expect } = require('@playwright/test');

test.describe('Netvanguard Webpage Creator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
  });

  test('Flujo completo: crear y descargar un sitio web', async ({ page }) => {
    // 1. Seleccionar plantilla
    await test.step('Seleccionar plantilla Landing Page', async () => {
      await page.locator('.template-card:has-text("Landing Page")').click();
      await expect(page.locator('#customizeView')).toBeVisible();
    });

    // 2. Personalizar contenido
    await test.step('Personalizar contenido', async () => {
      await page.fill('#siteTitle', 'Mi Startup Innovadora');
      await page.fill('#siteTagline', 'Transformando ideas en realidad');
      await page.fill('input[type="color"]', '#ff0000'); // Color rojo
    });

    // 3. Seleccionar estilo
    await test.step('Seleccionar estilo SaaS', async () => {
      await page.locator('.style-option:has-text("SaaS")').click();
    });

    // 4. Generar sitio web
    await test.step('Generar sitio web', async () => {
      const [response] = await Promise.all([
        page.waitForResponse('/generate'),
        page.click('#generateButton')
      ]);
      
      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody.html).toBeTruthy();
      expect(responseBody.css).toBeTruthy();
      expect(responseBody.js).toBeTruthy();
      
      await expect(page.locator('#editorView')).toBeVisible();
    });

    // 5. Usar editor de código
    await test.step('Interactuar con el editor', async () => {
      // Cambiar entre pestañas
      await page.click('#cssTab');
      await expect(page.locator('#cssTab.active')).toBeVisible();
      
      await page.click('#jsTab');
      await expect(page.locator('#jsTab.active')).toBeVisible();
      
      await page.click('#previewTab');
      await expect(page.locator('#previewTab.active')).toBeVisible();
      
      // Verificar vista previa
      const previewFrame = page.frameLocator('#livePreview');
      await expect(previewFrame.locator('body')).toBeVisible();
    });

    // 6. Descargar sitio web
    await test.step('Descargar sitio web', async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.click('#downloadFinalButton');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('website.html');
      // Para pruebas locales, puedes guardar el archivo:
      // await download.saveAs(`./downloads/${download.suggestedFilename()}`);
    });
  });

  test('Probar todas las plantillas', async ({ page }) => {
    const templates = [
      { name: 'Landing Page', id: 'landing' },
      { name: 'E-commerce', id: 'ecommerce' },
      { name: 'Blog', id: 'blog' },
      { name: 'Portfolio', id: 'portfolio' }
    ];

    for (const template of templates) {
      await test.step(`Probar plantilla: ${template.name}`, async () => {
        // Seleccionar plantilla
        await page.locator(`.template-card:has-text("${template.name}")`).click();
        await expect(page.locator('#customizeView')).toBeVisible();
        
        // Verificar nombre en la vista de personalización
        await expect(page.locator('#templateName')).toHaveText(template.name);
        
        // Verificar que hay estilos disponibles
        const styleOptions = await page.locator('.style-option').count();
        expect(styleOptions).toBeGreaterThan(0);
        
        // Volver a la vista inicial
        await page.click('#backButton');
        await expect(page.locator('#templateView')).toBeVisible();
      });
    }
  });

  test('Guardar plantilla personalizada', async ({ page }) => {
    // Navegar hasta el editor
    await page.locator('.template-card:has-text("Landing Page")').click();
    await page.click('#generateButton');
    await page.waitForSelector('#editorView');
    
    // Mockear el prompt
    await page.evaluate(() => {
      window.prompt = () => 'Mi Plantilla Personalizada';
    });
    
    // Hacer clic en guardar
    await page.click('#saveTemplateButton');
    
    // Verificar que se guardó en localStorage
    const userTemplates = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('userTemplates'));
    });
    
    expect(userTemplates).toBeTruthy();
    const savedTemplate = userTemplates.find(t => t.name === 'Mi Plantilla Personalizada');
    expect(savedTemplate).toBeTruthy();
    expect(savedTemplate.html.length).toBeGreaterThan(100);
  });

  test('Cambiar vista de dispositivos en preview', async ({ page }) => {
    await page.locator('.template-card:has-text("Landing Page")').click();
    
    // Tamaños esperados para los dispositivos
    const devices = {
      desktop: { width: 1280, height: 720 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };
    
    // Probar cada dispositivo
    for (const [device, size] of Object.entries(devices)) {
      await test.step(`Cambiar a vista ${device}`, async () => {
        await page.click(`.device-btn[data-device="${device}"]`);
        
        // Verificar que el botón está activo
        await expect(page.locator(`.device-btn[data-device="${device}"].active`)).toBeVisible();
        
        // Verificar el tamaño del preview
        const previewContent = page.locator('.preview-content');
        await expect(previewContent).toHaveCSS('width', `${size.width}px`);
        await expect(previewContent).toHaveCSS('height', `${size.height}px`);
      });
    }
  });

  test('Validar navegación entre pasos', async ({ page }) => {
    // Paso 1: Selección de plantilla
    await expect(page.locator('.step[data-step="1"].active')).toBeVisible();
    
    // Ir a paso 2
    await page.locator('.template-card:has-text("Landing Page")').click();
    await expect(page.locator('.step[data-step="2"].active')).toBeVisible();
    
    // Volver a paso 1
    await page.click('#backButton');
    await expect(page.locator('.step[data-step="1"].active')).toBeVisible();
    
    // Ir a paso 3 (editor)
    await page.locator('.template-card:has-text("Landing Page")').click();
    await page.click('#generateButton');
    await page.waitForSelector('#editorView');
    await expect(page.locator('.step[data-step="3"].active')).toBeVisible();
    
    // Volver a paso 2 desde editor
    await page.click('#editorBackButton');
    await expect(page.locator('.step[data-step="2"].active')).toBeVisible();
  });

  test('Manejo de errores en generación', async ({ page }) => {
    // Mockear respuesta de error
    await page.route('/generate', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Error en el servidor' })
    }));

    // Intentar generar
    await page.locator('.template-card:has-text("Landing Page")').click();
    await page.click('#generateButton');
    
    // Verificar manejo de error
    const errorMessage = await page.evaluate(async () => {
      return new Promise(resolve => {
        setTimeout(() => {
          const errorEl = document.querySelector('.error-message');
          resolve(errorEl ? errorEl.textContent : '');
        }, 1000);
      });
    });

    expect(errorMessage).toContain('Error en el servidor');
  });
});
