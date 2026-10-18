import { AdminService } from './admin.service';

describe('AdminService - online payments only', () => {
  it('reports COD disabled for legacy settings', async () => {
    const prisma = {
      storeSettings: { findUnique: jest.fn().mockResolvedValue({ id: 'singleton', codEnabled: true }) },
    };
    const service = new AdminService(prisma as any, {} as any, {} as any, {} as any);
    expect(await service.getSettings()).toEqual({ id: 'singleton', codEnabled: false });
  });

  it('cannot re-enable COD through settings updates', async () => {
    const prisma = { storeSettings: { upsert: jest.fn() } };
    const service = new AdminService(prisma as any, {} as any, {} as any, {} as any);
    await service.updateSettings({ codEnabled: true, razorpayEnabled: true });
    expect(prisma.storeSettings.upsert).toHaveBeenCalledWith({
      where: { id: 'singleton' },
      update: expect.objectContaining({ codEnabled: false, razorpayEnabled: true }),
      create: expect.objectContaining({ codEnabled: false, razorpayEnabled: true }),
    });
  });
});
