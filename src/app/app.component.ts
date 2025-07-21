import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="main-container">
      <header class="header">
        <h1 class="title">Sai Dental Care</h1>
        <p class="subtitle">Professional Dental Services</p>
      </header>
      
      <main class="content">
        <section class="welcome-section">
          <h2>Welcome to Sai Dental Care</h2>
          <p>Your trusted partner for comprehensive dental health solutions.</p>
          
          <div class="features-grid">
            <div class="feature-card">
              <h3>Professional Care</h3>
              <p>Expert dental professionals providing top-quality treatments.</p>
            </div>
            <div class="feature-card">
              <h3>Modern Equipment</h3>
              <p>State-of-the-art technology for precise and comfortable procedures.</p>
            </div>
            <div class="feature-card">
              <h3>Patient Comfort</h3>
              <p>Comfortable environment designed with patient care in mind.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .main-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .header {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    
    .title {
      font-size: 2.5rem;
      margin: 0;
      font-weight: 300;
    }
    
    .subtitle {
      font-size: 1.2rem;
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
    }
    
    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-section h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .welcome-section > p {
      text-align: center;
      font-size: 1.1rem;
      margin-bottom: 3rem;
      opacity: 0.9;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 2rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-card h3 {
      margin-top: 0;
      font-size: 1.3rem;
      margin-bottom: 1rem;
    }
    
    .feature-card p {
      opacity: 0.9;
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .title {
        font-size: 2rem;
      }
      
      .content {
        padding: 1rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .feature-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'sai-dental-care-ui';
}
