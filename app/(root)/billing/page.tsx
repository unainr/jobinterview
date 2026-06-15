import BillingView from '@/modules/credits/ui/view/billing-view'
import { Suspense } from 'react'

const BilingPage = () => {
  return (
       <Suspense fallback={<div>Loading...</div>}>

        <BillingView/>
    </Suspense>
  )
}

export default BilingPage