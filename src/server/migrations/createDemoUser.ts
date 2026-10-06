import { dbUsers } from 'modelence/server';
import bcrypt from 'bcrypt';

export async function createDemoUser() {
  const email = 'demo@modelence.dev';
  const hash = await bcrypt.hash('12345678', 10);
  const existing = await dbUsers.findOne({ handle: email });

  if (existing) {
    await dbUsers.updateOne(
      { _id: existing._id },
      {
        $set: {
          status: 'active',
          'emails.0.verified': true,
          'authMethods.password.hash': hash,
        },
      }
    );
    console.log('Demo user verified and synced: demo@modelence.dev (password: 12345678)');
    return;
  }

  await dbUsers.insertOne({
    handle: email,
    status: 'active',
    emails: [{
      address: email,
      verified: true,
    }],
    createdAt: new Date(),
    authMethods: {
      password: {
        hash,
      },
    },
  });
  console.log('Demo user created: demo@modelence.dev (password: 12345678)');
}
