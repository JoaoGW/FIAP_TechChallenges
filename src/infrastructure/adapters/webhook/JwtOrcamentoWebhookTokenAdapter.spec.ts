import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtOrcamentoWebhookTokenAdapter } from './JwtOrcamentoWebhookTokenAdapter';

describe('JwtOrcamentoWebhookTokenAdapter', () => {
  function makeAdapter(expiresIn = '1h') {
    const config = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'WEBHOOK_SECRET') {
          return 'test-webhook-secret-with-at-least-32-characters';
        }
        throw new Error(`Config nao encontrada: ${key}`);
      }),
      get: jest.fn((key: string) => {
        if (key === 'WEBHOOK_TOKEN_EXPIRES_IN') return expiresIn;
        return undefined;
      }),
    } as unknown as ConfigService;

    return new JwtOrcamentoWebhookTokenAdapter(new JwtService(), config);
  }

  it('deve gerar e validar token de webhook', async () => {
    const adapter = makeAdapter();

    const token = await adapter.gerarToken({ osId: 'os-1', acao: 'aprovar' });
    const payload = await adapter.validarToken(token);

    expect(payload).toEqual({ osId: 'os-1', acao: 'aprovar' });
  });

  it('deve rejeitar token expirado', async () => {
    const adapter = makeAdapter(-10 as any);

    const token = await adapter.gerarToken({ osId: 'os-1', acao: 'recusar' });

    await expect(adapter.validarToken(token)).rejects.toThrow();
  });
});
