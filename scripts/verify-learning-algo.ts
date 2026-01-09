
import { calculateNextReview, SpacedRepetitionItem } from '../src/lib/spaced-repetition';

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (e) {
        console.error(`❌ ${name}`, e);
    }
}

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(message);
    }
}

const mockItem = (stage: number, interval: number): SpacedRepetitionItem => ({
    id: 'test',
    userId: 'user',
    questionId: 'q',
    easiness: 2.5,
    interval,
    repetition: 0,
    stage,
    dueDate: new Date(),
    lastReview: new Date()
});

console.log('--- Verifying Learning Algorithm ---');

test('Stage 0 -> Correct -> Stage 1 (Interval 1)', () => {
    const item = mockItem(0, 0);
    const result = calculateNextReview(item, { isCorrect: true });
    assert(result.stage === 1, `Expected stage 1, got ${result.stage}`);
    assert(result.interval === 1, `Expected interval 1, got ${result.interval}`);
});

test('Stage 1 -> Correct -> Stage 2 (Interval 3)', () => {
    const item = mockItem(1, 1);
    const result = calculateNextReview(item, { isCorrect: true });
    assert(result.stage === 2, `Expected stage 2, got ${result.stage}`);
    assert(result.interval === 3, `Expected interval 3, got ${result.interval}`);
});

test('Stage 2 -> Correct -> Stage 3 (Interval 7)', () => {
    const item = mockItem(2, 3);
    const result = calculateNextReview(item, { isCorrect: true });
    assert(result.stage === 3, `Expected stage 3, got ${result.stage}`);
    assert(result.interval === 7, `Expected interval 7, got ${result.interval}`);
});

test('Stage 3 -> Correct -> Stage 4 (Interval 21)', () => {
    const item = mockItem(3, 7);
    const result = calculateNextReview(item, { isCorrect: true });
    assert(result.stage === 4, `Expected stage 4, got ${result.stage}`);
    assert(result.interval === 21, `Expected interval 21, got ${result.interval}`);
});

test('Stage 4 -> Correct -> Stage 5 (Interval 60)', () => {
    const item = mockItem(4, 21);
    const result = calculateNextReview(item, { isCorrect: true });
    assert(result.stage === 5, `Expected stage 5, got ${result.stage}`);
    assert(result.interval === 60, `Expected interval 60, got ${result.interval}`);
});

test('Stage 5 -> Correct -> Stage 5 (Cap at 60/Stage 5)', () => {
    const item = mockItem(5, 60);
    const result = calculateNextReview(item, { isCorrect: true });
    assert(result.stage === 5, `Expected stage 5, got ${result.stage}`);
    assert(result.interval === 60, `Expected interval 60, got ${result.interval}`);
});

test('Stage 3 -> Incorrect -> Stage 1 (Drop 2 stages)', () => {
    const item = mockItem(3, 7);
    const result = calculateNextReview(item, { isCorrect: false });
    assert(result.stage === 1, `Expected stage 1 (3-2), got ${result.stage}`);
    assert(result.interval === 1, `Expected interval 1, got ${result.interval}`);
});

test('Stage 1 -> Incorrect -> Stage 0 (Min 0)', () => {
    const item = mockItem(1, 1);
    const result = calculateNextReview(item, { isCorrect: false });
    assert(result.stage === 0, `Expected stage 0, got ${result.stage}`);
    assert(result.interval === 0, `Expected interval 0, got ${result.interval}`);
});

test('Stage 0 -> Incorrect -> Stage 0 (Min 0)', () => {
    const item = mockItem(0, 0);
    const result = calculateNextReview(item, { isCorrect: false });
    assert(result.stage === 0, `Expected stage 0, got ${result.stage}`);
    assert(result.interval === 0, `Expected interval 0, got ${result.interval}`);
});

console.log('--- Verification Complete ---');
