import useSWR from 'swr'

interface MasteryStats {
    masteryPercentage: number
    totalXP: number
    totalItems: number
    breakdown: {
        new: number
        learning: number
        review: number
        mastered: number
    }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useMastery() {
    const { data, error, isLoading, mutate } = useSWR<MasteryStats>(
        '/api/learning?action=stats',
        fetcher,
        {
            refreshInterval: 0, // Don't auto-poll aggressively, we control updates
            revalidateOnFocus: true
        }
    )

    return {
        stats: data,
        percentage: data?.masteryPercentage || 0,
        isLoading,
        isError: error,
        refresh: mutate
    }
}
