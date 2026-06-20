import BillingView from '@/modules/credits/ui/view/billing-view'
import BillingSkeleton from '@/modules/credits/ui/components/billing-skeleton'
import { Suspense } from 'react'

const BilingPage = () => {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingView/>
    </Suspense>
  )
}

export default BilingPage